/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const CompilerContext = require('../core/GraphQLCompilerContext');
const IRTransformer = require('../core/GraphQLIRTransformer');

const getLiteralArgumentValues = require('../core/getLiteralArgumentValues');
const getNormalizationOperationName = require('../core/getNormalizationOperationName');

const {getRawType} = require('../core/GraphQLSchemaUtils');
const {createUserError} = require('../core/RelayCompilerError');
const {
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLList,
  GraphQLString,
  getNullableType,
} = require('graphql');

import type {
  InlineFragment,
  FragmentSpread,
  LinkedField,
  ScalarField,
} from '../core/GraphQLIR';
import type {GraphQLCompositeType, GraphQLType} from 'graphql';

const SUPPORTED_ARGUMENT_NAME = 'supported';

const JS_FIELD_TYPE = 'JSDependency';
const JS_FIELD_ARG = 'module';
const JS_FIELD_NAME = 'js';

const SCHEMA_EXTENSION = `
  directive @match on FIELD

  directive @module(
    name: String!
  ) on FRAGMENT_SPREAD
`;

/**
 * This transform rewrites LinkedField nodes with @match and rewrites them
 * into `LinkedField` nodes with a `supported` argument.
 */
function relayMatchTransform(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(
    context,
    {
      LinkedField: visitLinkedField,
      InlineFragment: visitInlineFragment,
    },
    node => node.type,
  );
}

function visitInlineFragment(
  node: InlineFragment,
  state: GraphQLType,
): InlineFragment {
  return this.traverse(node, node.typeCondition);
}

function visitLinkedField(
  node: LinkedField,
  parentType: GraphQLType,
): LinkedField {
  const transformedNode: LinkedField = this.traverse(node, node.type);

  const matchDirective = transformedNode.directives.find(
    directive => directive.name === 'match',
  );
  if (matchDirective == null) {
    return transformedNode;
  }

  const rawType = getRawType(parentType);
  if (
    !(
      rawType instanceof GraphQLInterfaceType ||
      rawType instanceof GraphQLObjectType
    )
  ) {
    throw createUserError(
      '@match may only be used on fields whose parent type is an interface ' +
        `or object, field '${node.name}' has invalid type '${String(
          parentType,
        )}'`,
      [node.loc],
    );
  }

  const context: CompilerContext = this.getContext();
  const schema = context.serverSchema;
  const jsModuleType = schema.getType(JS_FIELD_TYPE);
  if (jsModuleType == null || !(jsModuleType instanceof GraphQLScalarType)) {
    throw createUserError(
      `RelayMatchTransform: Expected schema to define a scalar '${JS_FIELD_TYPE}' type.`,
    );
  }

  const currentField = rawType.getFields()[transformedNode.name];
  const supportedArg = currentField.args.find(
    ({name}) => SUPPORTED_ARGUMENT_NAME,
  );

  const supportedArgType =
    supportedArg != null ? getNullableType(supportedArg.type) : null;
  const supportedArgOfType =
    supportedArgType != null && supportedArgType instanceof GraphQLList
      ? supportedArgType.ofType
      : null;
  if (
    supportedArg == null ||
    supportedArgType == null ||
    supportedArgOfType == null ||
    getNullableType(supportedArgOfType) !== GraphQLString
  ) {
    throw createUserError(
      'RelayMatchTransform: @match used on an incompatible ' +
        `field '${transformedNode.name}'. @match may only ` +
        `be used with fields that can accept '${SUPPORTED_ARGUMENT_NAME}' ` +
        "argument with type '[String!]!'.",
      [node.loc],
    );
  }

  const unionType = transformedNode.type;
  if (!(unionType instanceof GraphQLUnionType)) {
    throw createUserError(
      'RelayMatchTransform: You are trying to apply @match ' +
        `directive to a field '${transformedNode.name}' that has unsupported ` +
        `output type. '${transformedNode.name}' output type should be union ` +
        'type of object types.',
      [node.loc],
    );
  }

  const seenTypes: Map<GraphQLCompositeType, FragmentSpread> = new Map();
  const typeToSelectionMap = {};
  const selections = [];
  transformedNode.selections.forEach(matchSelection => {
    if (matchSelection.kind !== 'FragmentSpread') {
      throw createUserError(
        'RelayMatchTransform: all selections in a @match field should be ' +
          `fragment spreads, got '${matchSelection.kind}'.`,
        [matchSelection.loc],
      );
    }
    if (matchSelection.args.length !== 0) {
      throw createUserError(
        'RelayMatchTransform: Unexpected use of @arguments in @match, ' +
          '@arguments is not currently supported.',
        [matchSelection.args[0]?.loc ?? matchSelection.loc],
      );
    }
    const fragment = context.getFragment(matchSelection.name);
    if (!(fragment.type instanceof GraphQLObjectType)) {
      throw createUserError(
        'RelayMatchTransform: all fragment spreads in a @match field should ' +
          'be for fragments on an object type. Union or interface type ' +
          `'${fragment.type.name}' for '...${fragment.name}' is not supported.`,
        [matchSelection.loc, fragment.loc],
      );
    }
    const matchedType = fragment.type;
    const previousTypeUsage = seenTypes.get(matchedType);
    if (previousTypeUsage) {
      throw createUserError(
        'RelayMatchTransform: Each "match" type has to appear at-most once. ' +
          `Type '${
            matchedType.name
          }' was matched in multiple fragment spreads.`,
        [matchSelection.loc, previousTypeUsage.loc],
      );
    }
    seenTypes.set(matchedType, matchSelection);

    const belongsToUnion = unionType.getTypes().includes(matchedType);
    if (!belongsToUnion) {
      throw createUserError(
        `RelayMatchTransform: Unsupported type '${matchedType.toString()}' ` +
          'in the list of matches in the @match. Type ' +
          `'${String(matchedType)}' does not belong to the union ` +
          `'${String(unionType)}'.`,
        [matchSelection.loc, fragment.loc],
      );
    }
    const jsField = matchedType.getFields()[JS_FIELD_NAME];
    const jsFieldArg = jsField
      ? jsField.args.find(arg => arg.name === JS_FIELD_ARG)
      : null;
    if (
      jsField == null ||
      jsFieldArg == null ||
      getNullableType(jsFieldArg.type) !== GraphQLString ||
      jsField.type.name !== jsModuleType.name // object identity fails in tests
    ) {
      throw createUserError(
        `RelayMatchTransform: expcted type '${
          matchedType.name
        }' to have a '${JS_FIELD_NAME}(${JS_FIELD_ARG}: String!): ${JS_FIELD_TYPE}' field .`,
        [matchSelection.loc],
      );
    }

    const moduleDirective = matchSelection.directives.find(
      directive => directive.name === 'module',
    );
    if (moduleDirective == null || matchSelection.directives.length !== 1) {
      throw createUserError(
        'RelayMatchTransform: Fragment spreads in a @match field must have a ' +
          "'@module' directive and no other directives, got invalid directives." +
          `on fragment spread '...${matchSelection.name}'`,
        [matchSelection.loc],
      );
    }
    const moduleDirectiveArgs = getLiteralArgumentValues(moduleDirective.args);
    typeToSelectionMap[String(matchedType)] = {
      component: moduleDirectiveArgs.name,
      fragment: matchSelection.name,
    };
    const normalizationName =
      getNormalizationOperationName(matchSelection.name) + '.graphql';
    const moduleField: ScalarField = {
      alias: '__module_component',
      args: [
        {
          kind: 'Argument',
          name: JS_FIELD_ARG,
          type: jsFieldArg.type,
          value: {
            kind: 'Literal',
            loc: moduleDirective.args[0]?.loc ?? moduleDirective.loc,
            metadata: {},
            value: moduleDirectiveArgs.name,
          },
          loc: moduleDirective.loc,
          metadata: {},
        },
      ],
      directives: [],
      handles: null,
      kind: 'ScalarField',
      loc: moduleDirective.loc,
      metadata: {
        storageKey: '__module_component',
      },
      name: JS_FIELD_NAME,
      type: jsModuleType,
    };
    const fragmentField: ScalarField = {
      alias: '__module_operation',
      args: [
        {
          kind: 'Argument',
          name: JS_FIELD_ARG,
          type: jsFieldArg.type,
          value: {
            kind: 'Literal',
            loc: matchSelection.loc,
            metadata: {},
            value: normalizationName,
          },
          loc: matchSelection.loc,
          metadata: {},
        },
      ],
      directives: [],
      handles: null,
      kind: 'ScalarField',
      loc: matchSelection.loc,
      metadata: {
        storageKey: '__module_operation',
      },
      name: JS_FIELD_NAME,
      type: jsModuleType,
    };

    selections.push({
      kind: 'InlineFragment',
      directives: [],
      loc: matchSelection.loc,
      metadata: null,
      selections: [
        {
          kind: 'ModuleImport',
          loc: matchSelection.loc,
          module: moduleDirectiveArgs.name,
          name: matchSelection.name,
          selections: [
            {
              args: [],
              directives: [],
              kind: 'FragmentSpread',
              loc: matchSelection.loc,
              metadata: {},
              name: matchSelection.name,
            },
            {
              directives: [],
              kind: 'InlineFragment',
              loc: matchSelection.loc,
              metadata: {},
              selections: [moduleField, fragmentField],
              typeCondition: matchedType,
            },
          ],
        },
      ],
      typeCondition: matchedType,
    });
  });

  const stableArgs = [];
  Object.keys(typeToSelectionMap)
    .sort()
    .forEach(typeName => {
      const {component, fragment} = typeToSelectionMap[typeName];
      stableArgs.push(`${fragment}:${component}`);
    });
  const storageKey =
    (transformedNode.alias ?? transformedNode.name) +
    `(${stableArgs.join(',')})`;

  return {
    kind: 'LinkedField',
    alias: transformedNode.alias,
    args: [
      {
        kind: 'Argument',
        name: SUPPORTED_ARGUMENT_NAME,
        type: supportedArg.type,
        value: {
          kind: 'Literal',
          loc: node.loc,
          metadata: {},
          value: Array.from(seenTypes.keys()).map(type => type.name),
        },
        loc: node.loc,
        metadata: {},
      },
    ],
    directives: [],
    handles: null,
    loc: node.loc,
    metadata: {
      storageKey,
    },
    name: transformedNode.name,
    type: unionType,
    selections,
  };
}

module.exports = {
  SCHEMA_EXTENSION,
  transform: relayMatchTransform,
};
