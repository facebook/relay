/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule BabelPluginGraphQL
 */

'use strict';

const GraphQL = require('graphql');

const PROVIDES_MODULE = 'providesModule';

/* eslint-disable comma-dangle */

function create() {
  return function BabelPluginGraphQL(babel) {
    const t = babel.types;

    return {
      visitor: {
        /**
         * Extract the module name from `@providesModule`.
         */
        Program(node, state) {
          const parent = node.parent;
          if (state.file.opts.documentName) {
            return;
          }
          let documentName;
          if (parent.comments && parent.comments.length) {
            const docblock = parent.comments[0].value || '';
            const propertyRegex = /@(\S+) *(\S*)/g;
            let captures;
            while ((captures = propertyRegex.exec(docblock))) {
              const property = captures[1];
              const value = captures[2];
              if (property === PROVIDES_MODULE) {
                documentName = value.replace(/[-.:]/g, '_');
                break;
              }
            }
          }
          const basename = state.file.opts.basename;
          if (basename && !documentName) {
            const captures = basename.match(/^[_A-Za-z][_0-9A-Za-z]*/);
            if (captures) {
              documentName = captures[0];
            }
          }
          state.file.opts.documentName = documentName || 'UnknownFile';
        },

        TaggedTemplateExpression(path, state) {
          const tag = path.get('tag');
          let tagName;
          if (tag.isIdentifier({name: 'graphql'})) {
            tagName = 'graphql';
          } else if (tag.matchesPattern('graphql.experimental')) {
            tagName = 'graphql.experimental';
          } else {
            return;
          }

          if (path.node.quasi.quasis.length !== 1) {
            throw new Error(
              'BabelPluginGraphQL: Substitutions are not allowed in ' +
              'graphql fragments. Included fragments should be referenced ' +
              'as `...MyModule_propName`.'
            );
          }

          const text = path.node.quasi.quasis[0].value.raw;
          const ast = GraphQL.parse(text);

          if (ast.definitions.length === 0) {
            throw new Error(
              'BabelPluginGraphQL: Unexpected empty graphql tag.'
            );
          }
          validateTag(tagName, text);

          const mainDefinition = ast.definitions[0];

          if (mainDefinition.kind === 'FragmentDefinition') {
            const objPropName = getAssignedObjectPropertyName(t, path);
            if (objPropName) {
              if (ast.definitions.length !== 1) {
                throw new Error(
                  'BabelPluginGraphQL: Expected exactly one fragment in the ' +
                  `graphql tag referenced by the property ${objPropName}.`
                );
              }
              return path.replaceWith(
                createFragmentConcreteNode(t, mainDefinition)
              );
            }

            const nodeMap = {};
            for (const definition of ast.definitions) {
              if (definition.kind !== 'FragmentDefinition') {
                throw new Error(
                  'BabelPluginGraphQL: Expected only fragments within this ' +
                  'graphql tag.'
                );
              }

              const [, propName] = getFragmentNameParts(definition.name.value);
              nodeMap[propName] = createFragmentConcreteNode(t, definition);
            }
            return path.replaceWith(createObject(t, nodeMap));
          }

          if (mainDefinition.kind === 'OperationDefinition') {
            if (ast.definitions.length !== 1) {
              throw new Error(
                'BabelPluginGraphQL: Expected exactly one operation ' +
                '(query, mutation, or subscription) per graphql tag.'
              );
            }

            return path.replaceWith(
              createOperationConcreteNode(t, mainDefinition)
            );
          }

          throw new Error(
            'BabelPluginGraphQL: Expected a fragment, mutation, query, or ' +
            'subscription, got `' + mainDefinition.kind + '`.'
          );
        },
      },
    };
  };
}

function getAssignedObjectPropertyName(t, path) {
  let property = path;
  while (property) {
    if (t.isObjectProperty(property) && property.node.key.name) {
      return property.node.key.name;
    }
    property = property.parentPath;
  }
}

function createFragmentConcreteNode(t, definition) {
  const definitionName = definition.name.value;

  const {
    legacyAST,
    fragments,
    variables,
    argumentDefinitions
  } = createLegacyAST(t, definition);
  const substitutions = createSubstitutionsForFragmentSpreads(t, fragments);

  const transformedAST = createObject(t, {
    kind: t.stringLiteral('FragmentDefinition'),
    argumentDefinitions: createFragmentArguments(
      t,
      argumentDefinitions,
      variables
    ),
    node: createRelayQLTemplate(t, legacyAST)
  });

  return createConcreteNode(
    t,
    definitionName,
    transformedAST,
    substitutions
  );
}

function createOperationConcreteNode(t, definition) {
  const definitionName = definition.name.value;
  const {legacyAST, fragments} = createLegacyAST(t, definition);
  const substitutions = createSubstitutionsForFragmentSpreads(t, fragments);
  const nodeAST = legacyAST.operation === 'query' ?
    createFragmentForOperation(t, legacyAST) :
    createRelayQLTemplate(t, legacyAST);
  const transformedAST = createObject(t, {
    kind: t.stringLiteral('OperationDefinition'),
    argumentDefinitions: createOperationArguments(
      t,
      definition.variableDefinitions
    ),
    name: t.stringLiteral(definitionName),
    operation: t.stringLiteral(legacyAST.operation),
    node: nodeAST,
  });

  return createConcreteNode(
    t,
    definitionName,
    transformedAST,
    substitutions
  );
}

function createLegacyAST(t, definition) {
  let fragmentID = 0;

  const fragments = {};
  const variables = {};
  let argumentDefinitions = null;

  const visitors = {
    Directive(node) {
      switch (node.name.value) {
        case 'argumentDefinitions':
          if (argumentDefinitions) {
            throw new Error(
              'BabelPluginGraphQL: Expected only one ' +
              '@argumentDefinitions directive'
            );
          }
          argumentDefinitions = node.arguments;
          return null;
        case 'connection':
          return null;
        default:
          return node;
      }
    },

    FragmentSpread(node) {
      const directives = node.directives;

      const fragmentName = node.name.value;
      let fragmentArgumentsAST = null;
      let substitutionName = null;

      if (directives.length === 0) {
        substitutionName = fragmentName;
      } else {
        // TODO: add support for @include and other directives.
        const directive = directives[0];
        if (
          directives.length !== 1 ||
          directive.name.value !== 'arguments'
        ) {
          throw new Error(
            'BabelPluginGraphQL: Unsupported directive `' +
            directive.name.value + '` on fragment spread `...' +
            fragmentName + '`.'
          );
        }
        const fragmentArgumentsObject = {};
        directive.arguments.forEach(argNode => {
          const arg = convertArgument(t, argNode);
          fragmentArgumentsObject[arg.name] = arg.ast;
        });
        fragmentArgumentsAST = createObject(t, fragmentArgumentsObject);
        fragmentID++;
        substitutionName = fragmentName + '_args' + fragmentID;
      }

      fragments[substitutionName] = {
        name: fragmentName,
        args: fragmentArgumentsAST,
      };
      return Object.assign({}, node, {
        name: {kind: 'Name', value: substitutionName},
        directives: [],
      });
    },

    Variable(node) {
      variables[node.name.value] = null;
      return node;
    }
  };
  const legacyAST = GraphQL.visit(definition, visitors);

  return {
    legacyAST,
    fragments,
    variables,
    argumentDefinitions
  };
}

function createConcreteNode(t, definitionName, transformedAST, substitutions) {
  return createObject(t, {
    relay: t.functionExpression(
      null,
      [],
      t.blockStatement([
        t.variableDeclaration(
          'const',
          [
            t.variableDeclarator(
              t.identifier('RelayQL_GENERATED'),
              createRequireCall(t, 'RelayQL_GENERATED')
            )
          ].concat(substitutions)
        ),
        t.returnStatement(transformedAST)
      ])
    ),
    relayExperimental: t.functionExpression(
      null,
      [],
      t.blockStatement([
        t.returnStatement(
          createRequireCall(t, definitionName + '.graphql')
        ),
      ])
    ),
  });
}

function createOperationArguments(t, variableDefinitions) {
  return t.arrayExpression(variableDefinitions.map(definition => {
    const name = definition.variable.name.value;
    const defaultValue = definition.defaultValue ?
      parseValue(t, definition.defaultValue) :
      t.nullLiteral();
    return createLocalArgument(t, name, defaultValue);
  }));
}

function createFragmentArguments(t, argumentDefinitions, variables) {
  const concreteDefinitions = [];
  Object.keys(variables).forEach(name => {
    const definition = (argumentDefinitions || []).find(
      arg => arg.name.value === name
    );
    if (definition) {
      const defaultValueField = definition.value.fields.find(
        field => field.name.value === 'defaultValue'
      );
      const defaultValue = defaultValueField ?
        parseValue(t, defaultValueField.value) :
        t.nullLiteral();
      concreteDefinitions.push(createLocalArgument(t, name, defaultValue));
    } else {
      concreteDefinitions.push(createRootArgument(t, name));
    }
  });
  return t.arrayExpression(concreteDefinitions);
}

function createLocalArgument(t, variableName, defaultValue) {
  return createObject(t, {
    defaultValue: defaultValue,
    kind: t.stringLiteral('LocalArgument'),
    name: t.stringLiteral(variableName)
  });
}

function createRootArgument(t, variableName) {
  return t.objectExpression([
    t.objectProperty(t.identifier('kind'), t.stringLiteral('RootArgument')),
    t.objectProperty(t.identifier('name'), t.stringLiteral(variableName)),
  ]);
}

function parseValue(t, value) {
  switch (value.kind) {
    case 'BooleanValue':
      return t.booleanLiteral(value.value);
    case 'IntValue':
      return t.numericLiteral(parseInt(value.value, 10));
    case 'FloatValue':
      return t.numericLiteral(parseFloat(value.value));
    case 'StringValue':
      return t.stringLiteral(value.value);
    case 'EnumValue':
      return t.stringLiteral(value.value);
    case 'ListValue':
      return t.arrayExpression(value.values.map(item => parseValue(t, item)));
    default:
      throw new Error(
        'BabelPluginGraphQL: Unsupported literal type `' + value.kind + '`.'
      );
  }
}

function convertArgument(t, argNode) {
  const name = argNode.name.value;
  const value = argNode.value;
  let ast = null;
  switch (value.kind) {
    case 'Variable':
      const paramName = value.name.value;
      ast = createObject(t, {
        kind: t.stringLiteral('CallVariable'),
        callVariableName: t.stringLiteral(paramName),
      });
      break;
    default:
      ast = parseValue(t, value);
  }
  return {name, ast};
}

function createObject(t, obj) {
  return t.objectExpression(
    Object.keys(obj).map(
      key => t.objectProperty(t.identifier(key), obj[key])
    )
  );
}

function createRequireCall(t, moduleName) {
  return t.callExpression(
    t.identifier('require'),
    [t.stringLiteral(moduleName)]
  );
}

function createFragmentForOperation(t, operation) {
  let type;
  switch (operation.operation) {
    case 'query':
      type = 'Query';
      break;
    case 'mutation':
      type = 'Mutation';
      break;
    case 'subscription':
      type = 'Subscription';
      break;
    default:
      throw new Error(
        'BabelPluginGraphQL: Unexpected operation type: `' +
        operation.operation + '`.'
      );
  }
  return createRelayQLTemplate(t, {
    kind: 'FragmentDefinition',
    loc: operation.loc,
    name: {
      kind: 'Name',
      value: operation.name.value,
    },
    typeCondition: {
      kind: 'NamedType',
      name: {
        kind: 'Name',
        value: type,
      },
    },
    directives: operation.directives,
    selectionSet: operation.selectionSet,
  });
}

function createRelayQLTemplate(t, node) {
  const text = GraphQL.print(node);
  return t.taggedTemplateExpression(
    t.identifier('RelayQL_GENERATED'),
    t.templateLiteral(
      [t.templateElement({raw: text, cooked: text}, true)],
      []
    )
  );
}

function getFragmentNameParts(fragmentName) {
  const match = fragmentName.match(/^(\w+)_(\w+)$/);
  if (!match) {
    throw new Error(
      'BabelPluginGraphQL: Fragments should be named ' +
      '`ModuleName_fragmentName`, got `' + fragmentName + '`.'
    );
  }
  const module = match[1];
  const propName = match[2];
  return [ module, propName ];
}

function createSubstitutionsForFragmentSpreads(t, fragments) {
  return Object.keys(fragments).map(varName => {
    const fragment = fragments[varName];
    const [module, propName] = getFragmentNameParts(fragment.name);
    return t.variableDeclarator(
      t.identifier(varName),
      createGetFragmentCall(t, module, propName, fragment.args)
    );
  });
}

function createGetFragmentCall(t, module, propName, fragmentArguments) {
  const args = [t.stringLiteral(propName)];

  if (fragmentArguments) {
    args.push(fragmentArguments);
  }

  return t.callExpression(
    t.memberExpression(
      t.identifier(module),
      t.identifier('getFragment')
    ),
    args
  );
}

function validateTag(tagName, text) {
  // All features enabled in experimental mode
  if (tagName === 'graphql.experimental') {
    return;
  }
  // `graphql` only supports spec-compliant GraphQL: experimental extensions
  // such as fragment arguments are disabled
  if (/@argument(Definition)?s\b/.test(text)) {
    throw new Error(
      'BabelPluginGraphQL: Unexpected use of fragment variables: ' +
      '@arguments and @argumentDefinitions are only supported in ' +
      'experimental mode. Source: ' + text
    );
  }
}

module.exports = {
  create: create,
};
