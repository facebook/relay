/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule createClassicNode
 * @format
 */

'use strict';

const GraphQL = require('graphql');

const compileRelayQLTag = require('./compileRelayQLTag');
const getFragmentNameParts = require('./getFragmentNameParts');
const invariant = require('./invariant');

/**
 * Relay Classic transforms to inline generated content.
 */
function createClassicNode(t, path, graphqlDefinition, state) {
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
    node: createRelayQLTemplate(t, classicAST, state),
  });

  return createConcreteNode(t, transformedAST, substitutions, state);
}

function createOperationConcreteNode(t, path, definition, state) {
  const {classicAST, fragments} = createClassicAST(t, definition);
  const substitutions = createSubstitutionsForFragmentSpreads(
    t,
    path,
    fragments,
  );
  const nodeAST = classicAST.operation === 'query'
    ? createFragmentForOperation(t, classicAST, state)
    : createRelayQLTemplate(t, classicAST, state);
  const transformedAST = createObject(t, {
    kind: t.stringLiteral('OperationDefinition'),
    argumentDefinitions: createOperationArguments(
      t,
      definition.variableDefinitions,
    ),
    name: t.stringLiteral(definition.name.value),
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

      if (directives.length === 0) {
        substitutionName = fragmentName;
      } else {
        // TODO: add support for @include and other directives.
        const directive = directives[0];
        if (directives.length !== 1 || directive.name.value !== 'arguments') {
          throw new Error(
            'BabelPluginRelay: Unsupported directive `' +
              directive.name.value +
              '` on fragment spread `...' +
              fragmentName +
              '`.',
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
    const definition = (argumentDefinitions || [])
      .find(arg => arg.name.value === name);
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

function createFragmentForOperation(t, operation, state) {
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
  return createRelayQLTemplate(t, fragmentNode, state);
}

function createRelayQLTemplate(t, node, state) {
  const schema = state.opts && state.opts.schema;
  invariant(
    schema,
    'babel-plugin-relay: Missing schema option. ' +
      'Check your .babelrc file or wherever you configure your Babel ' +
      'plugins to ensure the "relay" plugin has a "schema" option.\n' +
      'https://facebook.github.io/relay/docs/babel-plugin-relay.html#additional-options',
  );
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
    return t.variableDeclarator(
      t.identifier(varName),
      createGetFragmentCall(t, path, module, propName, fragment.args),
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
