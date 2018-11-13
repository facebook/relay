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
const {CompilerContext, IRTransformer} = require('graphql-compiler');

import type {MatchField, MatchFragmentSpread} from 'graphql-compiler';
import type {GraphQLCompositeType} from 'graphql';

const MATCH_DIRECTIVE_NAME = 'match';
const SUPPORTED_ARGUMENT_NAME = 'supported';

const SCHEMA_EXTENSION = `
  input RelayDataDependencyMatch {
    # Name of the fragment to match
    fragment: String!
    # The module load in case this case matches
    module: String!
  }

  directive @match(
    onTypes: [RelayDataDependencyMatch!]!
    experimental_skipInlineDoNotUse: Boolean
  ) on FIELD
`;

/**
 * This transform takes the raw MatchField nodes parsed by the compiler and
 * validates the types as well as generating the supported arguments field.
 */
function relayMatchTransform(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(context, {
    MatchField: visitMatchField,
    MatchFragmentSpread: visitMatchFragmentSpread,
  });
}

function visitMatchFragmentSpread(
  field: MatchFragmentSpread,
  state,
): MatchFragmentSpread {
  const transformedNode: MatchFragmentSpread = this.traverse(field, state);

  const context: CompilerContext = this.getContext();
  const type = context.getFragment(field.name).type;
  return {
    ...transformedNode,
    type,
  };
}

function visitMatchField(field: MatchField, state, parent?: mixed): MatchField {
  const transformedNode: MatchField = this.traverse(field, state);
  if (typeof parent !== 'object') {
    return transformedNode;
  }

  const schema = this.getContext().serverSchema;
  const parentType = schema.getType(parent?.type);
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
    invariant(
      matchCase.kind === 'MatchFragmentSpread',
      'RelayMatchTransform: selections on MatchField should all be ' +
        'MatchFragmentSpread.',
    );
    invariant(
      matchCase.type != null,
      'RelayMatchTransform: When reaching this code visitMatchField should ' +
        'have added the type.',
    );
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

  const result: MatchField = {
    ...transformedNode,
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
  };
  return result;
}

module.exports = {
  SCHEMA_EXTENSION,
  transform: relayMatchTransform,
};
