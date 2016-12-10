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

const invariant = require('invariant');

const PROVIDES_MODULE = 'providesModule';

/* eslint-disable comma-dangle */

function create(options) {
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
          if (!t.isIdentifier(path.node.tag, {name: 'graphql'})) {
            return;
          }

          invariant(
            path.node.quasi.quasis.length === 1,
            'BabelPluginGraphQL: Substitutions are not allowed in ' +
            'graphql fragments. Included fragments should be referenced ' +
            'as `...MyModule_propName`.'
          );

          const text = path.node.quasi.quasis[0].value.raw;
          const ast = GraphQL.parse(text);

          invariant(
            ast.definitions.length === 1,
            'BabelPluginGraphQL: Expected exactly one definition (fragment, ' +
            'mutation, query, or subscription) per graphql tag.'
          );
          const mainDefinition = ast.definitions[0];
          const definitionName = ast.definitions[0].name.value;
          const definitionKind = ast.definitions[0].kind;
          let fragmentID = 0;

          const fragments = {};
          const variables = {};
          let argumentDefinitions = null;
          let variableDefinitions = null;
          let usesParams = false;

          const visitors = {
            Directive(node) {
              switch (node.name.value) {
                case 'argumentDefinitions':
                  invariant(
                    !argumentDefinitions,
                    'BabelPluginGraphQL: Expected only one ' +
                    '@argumentDefinitions directive'
                  );
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
                invariant(
                  directives.length === 1 && directive.name.value === 'arguments',
                  'BabelPluginGraphQL: Unsupported directive `%s` on fragment ' +
                  'spread `...%s`; only the @arguments directive is supported ' +
                  'on fragment spreads when using the graphql tag.',
                  directive.name.value,
                  fragmentName
                );
                const fragmentArgumentsObject = {};
                directive.arguments.forEach(argNode => {
                  const arg = convertArgument(t, argNode);
                  fragmentArgumentsObject[arg.name] = arg.ast;
                  if (arg.usesParams) {
                    usesParams = true;
                  }
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

            OperationDefinition(node) {
              variableDefinitions = node.variableDefinitions;
              return node;
            },

            Variable(node) {
              variables[node.name.value] = null;
              return node;
            }
          };
          const legacyAST = GraphQL.visit(mainDefinition, visitors);
          const substitutions = createSubstitutionsForFragmentSpreads(t, fragments);
          let transformedAST;

          if (definitionKind === 'FragmentDefinition') {
            let currentPath = path;
            let keyName;
            while (currentPath) {
              if (t.isObjectProperty(currentPath)) {
                keyName = currentPath.node.key.name;
                break;
              }
              currentPath = currentPath.parentPath;
            }
            invariant(
              keyName,
              'BabelPluginGraphQL: graphql`...` fragment definitions may ' +
              'only appear as a property of an object literal inside a ' +
              'createContainer() call.'
            );

            const fragmentNameParts = definitionName.match(/(^\w+)_(\w+)$/);
            invariant(
              fragmentNameParts,
              'BabelPluginGraphQL: Fragment names in graphql tags have to ' +
              'be named as ModuleName_propName. Got `%s`',
              definitionName
            );
            invariant(
              fragmentNameParts[1] === state.file.opts.documentName,
              'BabelPluginGraphQL: Fragment names in graphql tags have to ' +
              'be named as ModuleName_propName. Got `%s`, but expected `%s`',
              definitionName,
              state.file.opts.documentName + '_' + keyName
            );
            invariant(
              fragmentNameParts[2] === keyName,
              'BabelPluginGraphQL: Fragment names in graphql tags have to ' +
              'be named as ModuleName_propName. Got `%s`, but the prop is ' +
              'named `%s`',
              definitionName,
              keyName
            );
            transformedAST = createObject(t, {
              kind: t.stringLiteral('FragmentDefinition'),
              argumentDefinitions: createFragmentArguments(
                t,
                argumentDefinitions,
                variables
              ),
              node: createRelayQLTemplate(t, legacyAST)
            });
          } else if (definitionKind === 'OperationDefinition') {
            const operationNameParts =
              definitionName.match(/^(\w+)(Mutation|Query|Subscription)$/);
            invariant(
              operationNameParts &&
              definitionName.indexOf(state.file.opts.documentName) === 0,
              'BabelPluginGraphQL: Operation names in graphql tags have ' +
              'to be prefixed with `ModuleName` and end in either "Mutation", ' +
              '"Query", or "Subscription". Got `%s` in module `%s`.',
              definitionName,
              state.file.opts.documentName
            );
            const fragmentAST = createFragmentFromRoot(t, legacyAST);
            const queryASTs = splitRootFields(t, legacyAST);
            transformedAST = createObject(t, {
              kind: t.stringLiteral('OperationDefinition'),
              argumentDefinitions: createOperationArguments(
                t,
                variableDefinitions
              ),
              fragment: fragmentAST,
              name: t.stringLiteral(definitionName),
              operation: t.stringLiteral(legacyAST.operation),
              queries: queryASTs
            });
          } else {
            invariant(
              false,
              'BabelPluginGraphQL: Expected a fragment, mutation, query, or ' +
              'subscription, got `%s`.',
              definitionKind
            );
          }

          const concreteNode = {
            relay: t.functionExpression(
              null,
              usesParams ? [
                t.identifier('params')
              ] : [],
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
          };
          if (options.relayExperimental) {
            concreteNode.relayExperimental = t.functionExpression(
              null,
              [],
              t.blockStatement([
                t.returnStatement(
                  createRequireCall(t, definitionName + '.relay2ql')
                ),
              ])
            );
          }
          path.replaceWith(createObject(t, concreteNode));
        },
      },
    };
  };
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
      invariant(
        false,
        'BabelPluginGraphQL: Unsupported literal type `%s`.',
        value.kind
      );
  }
}

function convertArgument(t, argNode) {
  const name = argNode.name.value;
  const value = argNode.value;
  let ast = null;
  let usesParams = false;
  switch (value.kind) {
    case 'Variable':
      const paramName = value.name.value;
      usesParams = true;
      ast = t.memberExpression(
        t.identifier('params'),
        t.identifier(paramName)
      );
      break;
    default:
      ast = parseValue(t, value);
  }
  return {name, ast, usesParams};
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

function createFragmentFromRoot(t, root) {
  return createRelayQLTemplate(t, {
    kind: 'FragmentDefinition',
    loc: root.loc,
    name: {
      kind: 'Name',
      value: root.name.value + '__fragment',
    },
    typeCondition: {
      kind: 'NamedType',
      name: {
        kind: 'Name',
        value: 'Query',
      },
    },
    directives: root.directives,
    selectionSet: root.selectionSet,
  });
}

function splitRootFields(t, root) {
  const properties = root.selectionSet.selections.map(selection => {
    invariant(
      selection.kind === 'Field',
      'BabelPluginGraphQL: Expected the root fields of operation `%s` to be ' +
      'fields, got `%s`.',
      root.name.value,
      selection.kind
    );
    const queryProp = selection.alias ?
      selection.alias.value :
      selection.name.value;
    return t.objectProperty(
      t.identifier(queryProp),
      createRelayQLTemplate(t, Object.assign({}, root, {
        name: {
          kind: 'Name',
          value: root.name.value + '_' + queryProp,
        },
        selectionSet: Object.assign({}, root.selectionSet, {
          selections: [Object.assign({}, selection, {
            alias: null,
          })],
        }),
      }))
    );
  });
  return t.objectExpression(properties);
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

function createSubstitutionsForFragmentSpreads(t, fragments) {
  return Object.keys(fragments).map(varName => {
    const fragment = fragments[varName];
    const match = fragment.name.match(/^(\w+)_(\w+)$/);
    invariant(
      match,
      'BabelPluginGraphQL: Fragments should be named ' +
      '`ModuleName_fragmentName`, got `%s`.',
      fragment.name
    );
    const module = match[1];
    const propName = match[2];
    return t.variableDeclarator(
      t.identifier(varName),
      createGetFragementCall(t, module, propName, fragment.args)
    );
  });
}

function createGetFragementCall(t, module, propName, fragmentArguments) {
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

module.exports = {
  create: create,
};
