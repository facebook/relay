/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule createClassicNode
 * @flow
 * @format
 */

'use strict';

const GraphQL = require('graphql');

const compileRelayQLTag = require('./compileRelayQLTag');
const getClassicTransformer = require('./getClassicTransformer');
const getFragmentNameParts = require('./getFragmentNameParts');
const invariant = require('./invariant');

import type {BabelState} from './BabelPluginRelay';
import typeof BabelTypes from 'babel-types';
import type {DefinitionNode} from 'graphql';

/**
 * Relay Classic transforms to inline generated content.
 */
function createClassicNode(
  t: BabelTypes,
  path: Object,
  graphqlDefinition: DefinitionNode,
  state: BabelState,
): Object {
  if (graphqlDefinition.kind === 'FragmentDefinition') {
    return createFragmentConcreteNode(t, path, graphqlDefinition, state);
  }

  if (graphqlDefinition.kind === 'OperationDefinition') {
    return createOperationConcreteNode(t, path, graphqlDefinition, state);
  }

  throw new Error(
    'BabelPluginRelay: Expected a fragment, mutation, query, or ' +
      'subscription, got `' +
      graphqlDefinition.kind +
      '`.',
  );
}

function createFragmentConcreteNode(t, path, definition, state) {
  const {
    classicAST,
    fragments,
    variables,
    argumentDefinitions,
  } = createClassicAST(t, definition);
  const substitutions = createSubstitutionsForFragmentSpreads(
    t,
    path,
    fragments,
  );

  const transformedAST = createObject(t, {
    kind: t.stringLiteral('FragmentDefinition'),
    argumentDefinitions: createFragmentArguments(
      t,
      argumentDefinitions,
      variables,
    ),
    node: createRelayQLTemplate(t, path, classicAST, state),
  });

  return createConcreteNode(t, transformedAST, substitutions, state);
}

function createOperationConcreteNode(t, path, definition, state) {
  const definitionName = definition.name;
  if (!definitionName) {
    throw new Error('GraphQL operations must contain names');
  }
  const {classicAST, fragments} = createClassicAST(t, definition);
  const substitutions = createSubstitutionsForFragmentSpreads(
    t,
    path,
    fragments,
  );
  const nodeAST =
    classicAST.operation === 'query'
      ? createFragmentForOperation(t, path, classicAST, state)
      : createRelayQLTemplate(t, path, classicAST, state);
  const transformedAST = createObject(t, {
    kind: t.stringLiteral('OperationDefinition'),
    argumentDefinitions: createOperationArguments(
      t,
      definition.variableDefinitions,
    ),
    name: t.stringLiteral(definitionName.value),
    operation: t.stringLiteral(classicAST.operation),
    node: nodeAST,
  });

  return createConcreteNode(t, transformedAST, substitutions, state);
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
                '@argumentDefinitions directive',
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
      let isMasked = true;

      // $FlowFixMe graphql 0.12.2
      if (directives.length === 0) {
        substitutionName = fragmentName;
      } else {
        // TODO: maybe add support when unmasked fragment has arguments.
        // $FlowFixMe graphql 0.12.2
        const directive = directives[0];
        invariant(
          directives.length === 1,
          'BabelPluginRelay: Cannot use both `@arguments` and `@relay(mask: false)` on the ' +
            'same fragment spread when in compat mode.',
        );
        switch (directive.name.value) {
          case 'arguments':
            const fragmentArgumentsObject = {};
            // $FlowFixMe graphql 0.12.2
            directive.arguments.forEach(argNode => {
              const argValue = argNode.value;
              if (argValue.kind === 'Variable') {
                variables[argValue.name.value] = null;
              }
              const arg = convertArgument(t, argNode);
              fragmentArgumentsObject[arg.name] = arg.ast;
            });
            fragmentArgumentsAST = createObject(t, fragmentArgumentsObject);
            fragmentID++;
            substitutionName = fragmentName + '_args' + fragmentID;
            break;
          case 'relay':
            const relayArguments = directive.arguments;
            invariant(
              // $FlowFixMe graphql 0.12.2
              relayArguments.length === 1 &&
                // $FlowFixMe graphql 0.12.2
                relayArguments[0].name.value === 'mask',
              'BabelPluginRelay: Expected `@relay` directive to only have `mask` argument in ' +
                'compat mode, but get %s',
              // $FlowFixMe graphql 0.12.2
              relayArguments[0].name.value,
            );
            substitutionName = fragmentName;
            // $FlowFixMe graphql 0.12.2
            isMasked = relayArguments[0].value.value !== false;
            break;
          default:
            throw new Error(
              'BabelPluginRelay: Unsupported directive `' +
                directive.name.value +
                '` on fragment spread `...' +
                fragmentName +
                '`.',
            );
        }
      }

      invariant(
        substitutionName,
        'BabelPluginRelay: Expected `substitutionName` to be non-null',
      );
      fragments[substitutionName] = {
        name: fragmentName,
        args: fragmentArgumentsAST,
        isMasked,
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

const RELAY_QL_GENERATED = 'RelayQL_GENERATED';

function createConcreteNode(t, transformedAST, substitutions, state) {
  const body = [t.returnStatement(transformedAST)];
  if (substitutions.length > 0) {
    body.unshift(t.variableDeclaration('const', substitutions));
  }
  return t.functionExpression(
    null,
    [t.identifier(RELAY_QL_GENERATED)],
    t.blockStatement(body),
  );
}

function createOperationArguments(t, variableDefinitions) {
  if (!variableDefinitions) {
    return t.arrayExpression([]);
  }
  return t.arrayExpression(
    variableDefinitions.map(definition => {
      const name = definition.variable.name.value;
      const defaultValue = definition.defaultValue
        ? parseValue(t, definition.defaultValue)
        : t.nullLiteral();
      return createLocalArgument(t, name, defaultValue);
    }),
  );
}

function createFragmentArguments(t, argumentDefinitions, variables) {
  const concreteDefinitions = [];
  Object.keys(variables).forEach(name => {
    const definition = (argumentDefinitions || []).find(
      arg => arg.name.value === name,
    );
    if (definition) {
      const defaultValueField = definition.value.fields.find(
        field => field.name.value === 'defaultValue',
      );
      const defaultValue = defaultValueField
        ? parseValue(t, defaultValueField.value)
        : t.nullLiteral();
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
        'BabelPluginRelay: Unsupported literal type `' + value.kind + '`.',
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

function createObject(t, obj: any) {
  return t.objectExpression(
    Object.keys(obj).map(key => t.objectProperty(t.identifier(key), obj[key])),
  );
}

function getSchemaOption(state) {
  const schema = state.opts && state.opts.schema;
  invariant(
    schema,
    'babel-plugin-relay: Missing schema option. ' +
      'Check your .babelrc file or wherever you configure your Babel ' +
      'plugins to ensure the "relay" plugin has a "schema" option.\n' +
      'https://facebook.github.io/relay/docs/babel-plugin-relay.html#additional-options',
  );
  return schema;
}

function createFragmentForOperation(t, path, operation, state) {
  let type;
  const schema = getSchemaOption(state);
  const fileOpts = (state.file && state.file.opts) || {};
  const transformer = getClassicTransformer(schema, state.opts || {}, fileOpts);
  switch (operation.operation) {
    case 'query':
      const queryType = transformer.schema.getQueryType();
      if (!queryType) {
        throw new Error('Schema does not contain a root query type.');
      }
      type = queryType.name;
      break;
    case 'mutation':
      const mutationType = transformer.schema.getMutationType();
      if (!mutationType) {
        throw new Error('Schema does not contain a root mutation type.');
      }
      type = mutationType.name;
      break;
    case 'subscription':
      const subscriptionType = transformer.schema.getSubscriptionType();
      if (!subscriptionType) {
        throw new Error('Schema does not contain a root subscription type.');
      }
      type = subscriptionType.name;
      break;
    default:
      throw new Error(
        'BabelPluginRelay: Unexpected operation type: `' +
          operation.operation +
          '`.',
      );
  }
  const fragmentNode = {
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
  };
  return createRelayQLTemplate(t, path, fragmentNode, state);
}

function createRelayQLTemplate(t, path, node, state) {
  const schema = getSchemaOption(state);
  const [documentName, propName] = getFragmentNameParts(node.name.value);
  const text = GraphQL.print(node);
  const quasi = t.templateLiteral(
    [t.templateElement({raw: text, cooked: text}, true)],
    [],
  );

  // Disable classic validation rules inside of `graphql` tags which are
  // validated by the RelayCompiler with less strict rules.
  const enableValidation = false;

  return compileRelayQLTag(
    t,
    path,
    schema,
    quasi,
    documentName,
    propName,
    RELAY_QL_GENERATED,
    enableValidation,
    state,
  );
}

function createSubstitutionsForFragmentSpreads(t, path, fragments) {
  return Object.keys(fragments).map(varName => {
    const fragment = fragments[varName];
    const [module, propName] = getFragmentNameParts(fragment.name);
    if (!fragment.isMasked) {
      invariant(
        path.scope.hasBinding(module) || path.scope.hasBinding(propName),
        `BabelPluginRelay: Please make sure module '${module}' is imported and not renamed or the
        fragment '${
          fragment.name
        }' is defined and bound to local variable '${propName}'. `,
      );
      const fragmentProp = path.scope.hasBinding(propName)
        ? t.memberExpression(t.identifier(propName), t.identifier(propName))
        : t.logicalExpression(
            '||',
            t.memberExpression(
              t.memberExpression(t.identifier(module), t.identifier(propName)),
              t.identifier(propName),
            ),
            t.memberExpression(t.identifier(module), t.identifier(propName)),
          );

      return t.variableDeclarator(
        t.identifier(varName),
        t.memberExpression(
          t.callExpression(
            t.memberExpression(
              t.identifier(RELAY_QL_GENERATED),
              t.identifier('__getClassicFragment'),
            ),
            [fragmentProp, t.booleanLiteral(true)],
          ),
          // Hack to extract 'ConcreteFragment' from 'ConcreteFragmentDefinition'
          t.identifier('node'),
        ),
      );
    } else {
      return t.variableDeclarator(
        t.identifier(varName),
        createGetFragmentCall(t, path, module, propName, fragment.args),
      );
    }
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
  const container = isDefinedLocally(path, module)
    ? t.logicalExpression(
        '||',
        // __container__ is defined via ReactRelayCompatContainerBuilder.
        t.memberExpression(t.identifier(module), t.identifier('__container__')),
        t.identifier(module),
      )
    : t.identifier(module);

  return t.callExpression(
    t.memberExpression(container, t.identifier('getFragment')),
    args,
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

module.exports = createClassicNode;
