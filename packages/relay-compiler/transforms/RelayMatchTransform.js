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

const invariant = require('invariant');

const {GraphQLObjectType, GraphQLUnionType} = require('graphql');
const {
  CompilerContext,
  IRTransformer,
  getLiteralArgumentValues,
} = require('graphql-compiler');

import type {LinkedField, MatchField} from 'graphql-compiler';
import type {GraphQLCompositeType} from 'graphql';

const MATCH_DIRECTIVE_NAME = 'match';
const SUPPORTED_ARGUMENT_NAME = 'supported';

const SCHEMA_EXTENSION = `
  directive @match(
    experimental_skipInlineDoNotUse: Boolean
  ) on FIELD

  directive @module(
    name: String!
  ) on FRAGMENT_SPREAD
`;

/**
 * This transform rewrites LinkedField nodes with @match and rewrites them
 * into MatchField nodes with a `supported` argument and MatchBranch selections.
 */
function relayMatchTransform(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(context, {
    // $FlowFixMe this transform intentionally changes the AST node type
    LinkedField: visitLinkedField,
  });
}

function visitLinkedField(
  node: LinkedField,
  state: mixed,
  parent?: mixed,
): LinkedField | MatchField {
  const transformedNode: LinkedField = this.traverse(node);

  const matchDirective = transformedNode.directives.find(
    directive => directive.name === 'match',
  );
  if (matchDirective == null || typeof parent !== 'object') {
    return transformedNode;
  }

  const matchDirectiveArgs = getLiteralArgumentValues(matchDirective.args);
  const experimental_skipInlineDoNotUse =
    matchDirectiveArgs.experimental_skipInlineDoNotUse ?? false;

  const context: CompilerContext = this.getContext();

  const parentType = context.serverSchema.getType(
    /* $FlowFixMe TODO T37368222 track the type while traversing the AST instead
     * of trying to figure it out based on the parent.
     */
    parent.type ?? parent.typeCondition,
  );
  if (!(parentType instanceof GraphQLObjectType)) {
    return transformedNode;
  }

  const currentField = parentType.getFields()[transformedNode.name];
  const supportedArg = currentField.args.find(
    ({name}) => SUPPORTED_ARGUMENT_NAME,
  );

  if (supportedArg == null || supportedArg.type.toString() !== '[String!]!') {
    throw new Error(
      `RelayMatchTransform: @${MATCH_DIRECTIVE_NAME} used on an incompatible ` +
        `field '${transformedNode.name}'. @${MATCH_DIRECTIVE_NAME} may only ` +
        `be used with fields that can accept '${SUPPORTED_ARGUMENT_NAME}' ` +
        "argument with type '[String!]!'.",
    );
  }

  const unionType = transformedNode.type;
  if (!(unionType instanceof GraphQLUnionType)) {
    throw new Error(
      `RelayMatchTransform: You are trying to apply @${MATCH_DIRECTIVE_NAME} ` +
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
          `the list of matches in the @${MATCH_DIRECTIVE_NAME}. Type ` +
          `"${matchedType.toString()}" does not belong to the union ` +
          `"${unionType.toString()}".`,
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
    selections.push({
      kind: 'MatchBranch',
      module: moduleDirectiveArgs.name,
      name: matchSelection.name,
      selections: [
        {
          args: [],
          directives: [],
          kind: 'FragmentSpread',
          metadata: null,
          name: matchSelection.name,
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
          metadata: null,
          value: Array.from(seenTypes.keys()).map(type => type.name),
        },
        metadata: null,
      },
    ],
    directives: [],
    handles: null,
    metadata: {
      experimental_skipInlineDoNotUse,
    },
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
