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

import type {
  FragmentSpread,
  LinkedField,
  MatchField,
  MatchFragmentSpread,
} from 'graphql-compiler';
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
 * This transform takes the raw MatchField nodes parsed by the compiler and
 * validates the types as well as generating the supported arguments field.
 */
function relayMatchTransform(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(context, {
    // $FlowFixMe this transform intentionally changes the AST node type
    LinkedField: visitLinkedField,
    // $FlowFixMe this transform intentionally changes the AST node type
    FragmentSpread: visitFragmentSpread,
  });
}

function visitFragmentSpread(
  node: FragmentSpread,
): FragmentSpread | MatchFragmentSpread {
  const transformedNode: FragmentSpread = this.traverse(node);

  const directives = transformedNode.directives;
  const moduleDirective = directives.find(
    directive => directive.name === 'module',
  );
  if (moduleDirective == null) {
    return transformedNode;
  }
  if (directives.length !== 1) {
    throw new Error(
      'RelayMatchTransform: The @module cannot be combined with other directives.',
    );
  }
  const moduleDirectiveArgs = getLiteralArgumentValues(moduleDirective.args);
  const context: CompilerContext = this.getContext();
  return ({
    kind: 'MatchFragmentSpread',
    type: context.getFragment(transformedNode.name).type,
    module: moduleDirectiveArgs.name,
    args: [],
    directives: [],
    metadata: null,
    name: transformedNode.name,
  }: MatchFragmentSpread);
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
  if (matchDirective == null) {
    return transformedNode;
  }

  const matchDirectiveArgs = getLiteralArgumentValues(matchDirective.args);
  const experimental_skipInlineDoNotUse =
    matchDirectiveArgs.experimental_skipInlineDoNotUse ?? false;

  if (typeof parent !== 'object') {
    return transformedNode;
  }

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

  const seenTypes: Set<GraphQLCompositeType> = new Set();
  const supportedTypes = transformedNode.selections.map(matchCase => {
    if (matchCase.kind !== 'MatchFragmentSpread') {
      throw new Error(
        'RelayMatchTransform: all selections in a @match field should have ' +
          'a @module directive.',
      );
    }
    const matchedType = matchCase.type;
    invariant(
      !seenTypes.has(matchedType),
      'RelayMatchTransform: Each "match" type has to appear at-most once. ' +
        'Type `%s` was duplicated.',
      matchedType,
    );
    seenTypes.add(matchedType);

    const belongsToUnion = unionType.getTypes().includes(matchedType);
    if (!belongsToUnion) {
      throw new Error(
        `RelayMatchTransform: Unsupported type '${matchedType.toString()}' in ` +
          `the list of matches in the @${MATCH_DIRECTIVE_NAME}. Type ` +
          `"${matchedType.toString()}" does not belong to the union ` +
          `"${unionType.toString()}".`,
      );
    }
    return matchedType.name;
  });

  return ({
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
          value: supportedTypes,
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
    selections: transformedNode.selections,
  }: MatchField);
}

module.exports = {
  SCHEMA_EXTENSION,
  transform: relayMatchTransform,
};
