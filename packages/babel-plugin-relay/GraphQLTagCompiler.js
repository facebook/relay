/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const GraphQL = require('graphql');

const DEFAULT_PROP_NAME = 'data';

function compileGraphQLTag(t, path, state, ast) {
  const isModernOnly = Boolean(state.opts && state.opts.modernOnly);

  const mainDefinition = ast.definitions[0];

  if (mainDefinition.kind === 'FragmentDefinition') {
    const objPropName = getAssignedObjectPropertyName(t, path);
    if (objPropName) {
      if (ast.definitions.length !== 1) {
        throw new Error(
          'BabelPluginRelay: Expected exactly one fragment in the ' +
          `graphql tag referenced by the property ${objPropName}.`
        );
      }
      return replaceMemoized(
        t,
        path,
        isModernOnly ?
          createModernConcreteNode(t, mainDefinition) :
          createCompatFragmentConcreteNode(t, path, mainDefinition)
      );
    }

    const nodeMap = {};
    for (const definition of ast.definitions) {
      if (definition.kind !== 'FragmentDefinition') {
        throw new Error(
          'BabelPluginRelay: Expected only fragments within this ' +
          'graphql tag.'
        );
      }

      const [, propName] = getFragmentNameParts(definition.name.value);
      nodeMap[propName] = isModernOnly ?
        createModernConcreteNode(t, definition) :
        createCompatFragmentConcreteNode(t, path, definition);
    }
    return replaceMemoized(t, path, createObject(t, nodeMap));
  }

  if (mainDefinition.kind === 'OperationDefinition') {
    if (ast.definitions.length !== 1) {
      throw new Error(
        'BabelPluginRelay: Expected exactly one operation ' +
        '(query, mutation, or subscription) per graphql tag.'
      );
    }
    return replaceMemoized(
      t,
      path,
      isModernOnly ?
        createModernConcreteNode(t, mainDefinition) :
        createCompatOperationConcreteNode(t, path, mainDefinition)
    );
  }

  throw new Error(
    'BabelPluginRelay: Expected a fragment, mutation, query, or ' +
    'subscription, got `' + mainDefinition.kind + '`.'
  );
}

function replaceMemoized(t, path, ast) {
  let topScope = path.scope;
  while (topScope.parent) {
    topScope = topScope.parent;
  }

  if (path.scope === topScope) {
    path.replaceWith(ast);
  } else {
    const id = topScope.generateDeclaredUidIdentifier('graphql');
    path.replaceWith(
      t.logicalExpression('||', id, t.assignmentExpression('=', id, ast))
    );
  }
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

function createModernConcreteNode(t, definition) {
  return t.functionExpression(
    null,
    [],
    t.blockStatement([
      t.returnStatement(
        createRequireCall(t, definition.name.value + '.graphql')
      ),
    ])
  );
}

function createCompatFragmentConcreteNode(t, path, definition) {
  const {
    classicAST,
    fragments,
    variables,
    argumentDefinitions,
  } = createClassicAST(t, definition);
  const substitutions = createSubstitutionsForFragmentSpreads(t, path, fragments);

  const transformedAST = createObject(t, {
    kind: t.stringLiteral('FragmentDefinition'),
    argumentDefinitions: createFragmentArguments(
      t,
      argumentDefinitions,
      variables
    ),
    node: createRelayQLTemplate(t, classicAST),
  });

  return createCompatConcreteNode(
    t,
    definition,
    transformedAST,
    substitutions
  );
}

function createCompatOperationConcreteNode(t, path, definition) {
  const {classicAST, fragments} = createClassicAST(t, definition);
  const substitutions = createSubstitutionsForFragmentSpreads(t, path, fragments);
  const nodeAST = classicAST.operation === 'query' ?
    createFragmentForOperation(t, classicAST) :
    createRelayQLTemplate(t, classicAST);
  const transformedAST = createObject(t, {
    kind: t.stringLiteral('OperationDefinition'),
    argumentDefinitions: createOperationArguments(
      t,
      definition.variableDefinitions
    ),
    name: t.stringLiteral(definition.name.value),
    operation: t.stringLiteral(classicAST.operation),
    node: nodeAST,
  });

  return createCompatConcreteNode(
    t,
    definition,
    transformedAST,
    substitutions
  );
}

function createClassicAST(t, definition) {
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
              'BabelPluginRelay: Expected only one ' +
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
            'BabelPluginRelay: Unsupported directive `' +
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
    },
  };
  const classicAST = GraphQL.visit(definition, visitors);

  return {
    classicAST,
    fragments,
    variables,
    argumentDefinitions,
  };
}

function createCompatConcreteNode(t, definition, transformedAST, substitutions) {
  return createObject(t, {
    relayExperimental: createModernConcreteNode(t, definition),
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
            ),
          ].concat(substitutions)
        ),
        t.returnStatement(transformedAST),
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
    name: t.stringLiteral(variableName),
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
        'BabelPluginRelay: Unsupported literal type `' + value.kind + '`.'
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
        'BabelPluginRelay: Unexpected operation type: `' +
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
  const match = fragmentName.match(
    /^([a-zA-Z][a-zA-Z0-9]*)(?:_([a-zA-Z][_a-zA-Z0-9]*))?$/
  );
  if (!match) {
    throw new Error(
      'BabelPluginGraphQL: Fragments should be named ' +
      '`ModuleName_fragmentName`, got `' + fragmentName + '`.'
    );
  }
  const module = match[1];
  const propName = match[2];
  if (propName === DEFAULT_PROP_NAME) {
    throw new Error(
      'BabelPluginGraphQL: Fragment `' + fragmentName + '` should not end in ' +
      '`_data` to avoid conflict with a fragment named `' + module + '` ' +
      'which also provides resulting data via the React prop `data`. Either ' +
      'rename this fragment to `' + module + '` or choose a different ' +
      'prop name.'
    );
  }
  return [ module, propName || DEFAULT_PROP_NAME ];
}

function createSubstitutionsForFragmentSpreads(t, path, fragments) {
  return Object.keys(fragments).map(varName => {
    const fragment = fragments[varName];
    const [module, propName] = getFragmentNameParts(fragment.name);
    return t.variableDeclarator(
      t.identifier(varName),
      createGetFragmentCall(t, path, module, propName, fragment.args)
    );
  });
}

function createGetFragmentCall(t, path, module, propName, fragmentArguments) {
  const args = [];
  if (propName) {
    args.push(t.stringLiteral(propName));
  }

  if (fragmentArguments) {
    args.push(fragmentArguments);
  }

  // If "module" is defined locally, then it's unsafe to assume it's a
  // container. It might be a bound reference to the React class itself.
  // To be safe, when defined locally, always check the __container__ property
  // first.
  const container = isDefinedLocally(path, module) ?
    t.logicalExpression('||',
      // __container__ is defined via ReactRelayCompatContainerBuilder.
      t.memberExpression(t.identifier(module), t.identifier('__container__')),
      t.identifier(module)
    ) :
    t.identifier(module);

  return t.callExpression(
    t.memberExpression(container, t.identifier('getFragment')),
    args
  );
}

function isDefinedLocally(path, name) {
  const binding = path.scope.getBinding(name);
  if (!binding) {
    return false;
  }

  // Binding comes from import.
  if (binding.kind === 'module') {
    return false;
  }

  // Binding comes from require.
  if (
    binding.path.isVariableDeclarator() &&
    binding.path.get('init').node &&
    binding.path.get('init.callee').isIdentifier({name: 'require'})
  ) {
    return false;
  }

  // Otherwise, defined locally.
  return true;
}

/**
 * Given a babel AST path to a tagged template literal, return an AST if it is
 * a graphql`` or graphql.experimental`` literal being used in a valid way.
 * If it is some other type of template literal then return nothing.
 */
function getValidGraphQLTag(path) {
  const tag = path.get('tag');

  const tagName =
    tag.isIdentifier({name: 'graphql'}) ? 'graphql' :
    tag.matchesPattern('graphql.experimental') ? 'graphql.experimental' :
    undefined;

  if (!tagName) {
    return;
  }

  const quasis = path.node.quasi.quasis;

  if (quasis.length !== 1) {
    throw new Error(
      'BabelPluginRelay: Substitutions are not allowed in ' +
      'graphql fragments. Included fragments should be referenced ' +
      'as `...MyModule_propName`.'
    );
  }

  const text = quasis[0].value.raw;

  // `graphql` only supports spec-compliant GraphQL: experimental extensions
  // such as fragment arguments are disabled
  if (tagName === 'graphql' && /@argument(Definition)?s\b/.test(text)) {
    throw new Error(
      'BabelPluginRelay: Unexpected use of fragment variables: ' +
      '@arguments and @argumentDefinitions are only supported in ' +
      'experimental mode. Source: ' + text
    );
  }

  const ast = GraphQL.parse(text);

  if (ast.definitions.length === 0) {
    throw new Error(
      'BabelPluginRelay: Unexpected empty graphql tag.'
    );
  }

  return ast;
}

module.exports = {
  getValidGraphQLTag,
  compileGraphQLTag,
};
