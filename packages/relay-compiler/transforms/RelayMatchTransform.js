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

const {
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLList,
  GraphQLString,
  getNullableType,
} = require('graphql');
const {
  CompilerContext,
  IRTransformer,
  getLiteralArgumentValues,
  SplitNaming,
} = require('graphql-compiler');

import type {
  InlineFragment,
  LinkedField,
  MatchField,
  ScalarField,
} from 'graphql-compiler';
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
 * into MatchField nodes with a `supported` argument and MatchBranch selections.
 */
function relayMatchTransform(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(
    context,
    {
      // $FlowFixMe this transform intentionally changes the AST node type
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
): LinkedField | MatchField {
  const transformedNode: LinkedField = this.traverse(node, node.type);

  const matchDirective = transformedNode.directives.find(
    directive => directive.name === 'match',
  );
  if (matchDirective == null) {
    return transformedNode;
  }

  if (
    !(
      parentType instanceof GraphQLInterfaceType ||
      parentType instanceof GraphQLObjectType
    )
  ) {
    throw new Error(
      'RelayMatchTransform: @match may only be used on fields whose parent ' +
        `type is an interface or object, field '${
          node.name
        }' has invalid type '${String(parentType)}'`,
    );
  }

  const context: CompilerContext = this.getContext();
  const schema = context.serverSchema;
  const jsModuleType = schema.getType(JS_FIELD_TYPE);
  if (jsModuleType == null || !(jsModuleType instanceof GraphQLScalarType)) {
    throw new Error(
      `RelayMatchTransform: Expected schema to define a scalar '${JS_FIELD_TYPE}' type.`,
    );
  }

  const currentField = parentType.getFields()[transformedNode.name];
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
    throw new Error(
      'RelayMatchTransform: @match used on an incompatible ' +
        `field '${transformedNode.name}'. @match may only ` +
        `be used with fields that can accept '${SUPPORTED_ARGUMENT_NAME}' ` +
        "argument with type '[String!]!'.",
    );
  }

  const unionType = transformedNode.type;
  if (!(unionType instanceof GraphQLUnionType)) {
    throw new Error(
      'RelayMatchTransform: You are trying to apply @match ' +
        `directive to a field '${transformedNode.name}' that has unsupported ` +
        `output type. '${transformedNode.name}' output type should be union ` +
        'type of object types.',
    );
  }

  const seenTypes: Map<GraphQLCompositeType, string> = new Map();
  const selections = [];
  transformedNode.selections.forEach(matchSelection => {
    if (matchSelection.kind !== 'FragmentSpread') {
      throw new Error(
        'RelayMatchTransform: all selections in a @match field should be ' +
          `fragment spreads, got '${matchSelection.kind}'.`,
      );
    }
    const fragment = context.getFragment(matchSelection.name);
    if (!(fragment.type instanceof GraphQLObjectType)) {
      throw new Error(
        'RelayMatchTransform: all fragment spreads in a @match field should ' +
          'be for fragments on an object type. Union or interface type ' +
          `'${fragment.type.name}' for '...${fragment.name}' is not supported.`,
      );
    }
    const matchedType = fragment.type;
    if (seenTypes.has(matchedType)) {
      throw new Error(
        'RelayMatchTransform: Each "match" type has to appear at-most once. ' +
          `Type '${matchedType.name}' was matched in both ` +
          `'...${matchSelection.name}' and '...${seenTypes.get(matchedType) ||
            '(unknown)'}'.`,
      );
    }
    seenTypes.set(matchedType, matchSelection.name);

    const belongsToUnion = unionType.getTypes().includes(matchedType);
    if (!belongsToUnion) {
      throw new Error(
        `RelayMatchTransform: Unsupported type '${matchedType.toString()}' in ` +
          'the list of matches in the @match. Type ' +
          `"${matchedType.toString()}" does not belong to the union ` +
          `"${unionType.toString()}".`,
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
      throw new Error(
        `RelayMatchTransform: expcted type '${
          matchedType.name
        }' to have a '${JS_FIELD_NAME}(${JS_FIELD_ARG}: String!): ${JS_FIELD_TYPE}' field .`,
      );
    }

    const moduleDirective = matchSelection.directives.find(
      directive => directive.name === 'module',
    );
    if (moduleDirective == null || matchSelection.directives.length !== 1) {
      throw new Error(
        'RelayMatchTransform: Fragment spreads in a @match field must have a ' +
          "'@module' directive and no other directives, got invalid directives " +
          `on fragment spread '...${matchSelection.name}'`,
      );
    }
    const moduleDirectiveArgs = getLiteralArgumentValues(moduleDirective.args);
    const normalizationName =
      SplitNaming.getAnnotatedName(matchSelection.name, 'normalization') +
      '.graphql';
    const moduleField: ScalarField = {
      alias: '__match_component',
      args: [
        {
          kind: 'Argument',
          name: JS_FIELD_ARG,
          type: jsFieldArg.type,
          value: {
            kind: 'Literal',
            metadata: {},
            value: moduleDirectiveArgs.name,
          },
          metadata: {},
        },
      ],
      directives: [],
      handles: null,
      kind: 'ScalarField',
      metadata: {
        storageKey: '__match_component',
      },
      name: JS_FIELD_NAME,
      type: jsModuleType,
    };
    const fragmentField: ScalarField = {
      alias: '__match_fragment',
      args: [
        {
          kind: 'Argument',
          name: JS_FIELD_ARG,
          type: jsFieldArg.type,
          value: {
            kind: 'Literal',
            metadata: {},
            value: normalizationName,
          },
          metadata: {},
        },
      ],
      directives: [],
      handles: null,
      kind: 'ScalarField',
      metadata: {
        storageKey: '__match_fragment',
      },
      name: JS_FIELD_NAME,
      type: jsModuleType,
    };

    selections.push({
      kind: 'MatchBranch',
      module: moduleDirectiveArgs.name,
      name: matchSelection.name,
      selections: [
        {
          args: [],
          directives: [],
          kind: 'FragmentSpread',
          metadata: {},
          name: matchSelection.name,
        },
        {
          directives: [],
          kind: 'InlineFragment',
          metadata: {},
          selections: [moduleField, fragmentField],
          typeCondition: matchedType,
        },
      ],
      type: matchedType,
    });
  });

  const matchField: MatchField = {
    kind: 'MatchField',
    alias: transformedNode.alias,
    args: [
      {
        kind: 'Argument',
        name: SUPPORTED_ARGUMENT_NAME,
        type: supportedArg.type,
        value: {
          kind: 'Literal',
          metadata: {},
          value: Array.from(seenTypes.keys()).map(type => type.name),
        },
        metadata: {},
      },
    ],
    directives: [],
    handles: null,
    metadata: {},
    name: transformedNode.name,
    type: unionType,
    selections,
  };
  // $FlowFixMe intentionally changing the result type in this transform
  return (matchField: LinkedField);
}

module.exports = {
  SCHEMA_EXTENSION,
  transform: relayMatchTransform,
};
