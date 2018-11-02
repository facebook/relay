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

import type {MatchField} from 'graphql-compiler';
import type {GraphQLCompositeType} from 'graphql';

const MATCH_DIRECTIVE_NAME = 'match';
const SUPPORTED_ARGUMENT_NAME = 'supported';

const SCHEMA_EXTENSION = `
  input RelayDataDependencyMatch {
    # Input type for items in the "match"
    type: String!
    fragment: String!
    module: String!
  }

  directive @match(
    onTypes: [RelayDataDependencyMatch!]!
  ) on FIELD
`;

/**
 * This transform takes the raw MatchField nodes parsed by the compiler and
 * validates the types as well as generating the supported arguments field.
 */
function relayMatchTransform(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(context, {
    MatchField: visitMatchField,
  });
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

  const currentField = parentType.getFields()[field.name];
  const supportedArg = currentField.args.find(
    ({name}) => SUPPORTED_ARGUMENT_NAME,
  );

  if (supportedArg == null || supportedArg.type.toString() !== '[String!]!') {
    throw new Error(
      `RelayMatchTransform: @${MATCH_DIRECTIVE_NAME} used on an incompatible ` +
        `field '${field.name}'. @${MATCH_DIRECTIVE_NAME} may only be used ` +
        `with fields that can accept '${SUPPORTED_ARGUMENT_NAME}' argument ` +
        "with type '[String!]!'.",
    );
  }

  const outputType = transformedNode.type;
  if (!(outputType instanceof GraphQLUnionType)) {
    throw new Error(
      `RelayMatchTransform: You are trying to apply @${MATCH_DIRECTIVE_NAME} ` +
        `directive to a field '${field.name}' that has unsupported output ` +
        `type. '${transformedNode.name}' output type should be union type of ` +
        'object types.',
    );
  }

  const seenTypes = new Set<GraphQLCompositeType>();
  const supportedTypes = transformedNode.selections.map(match => {
    invariant(
      match.kind === 'MatchFragmentSpread',
      'RelayMatchTransform: selections on MatchField should all be ' +
        'MatchFragmentSpread.',
    );
    invariant(
      !seenTypes.has(match.type),
      'RelayMatchTransform: Each "match" type has to appear at-most once. ' +
        'Type `%s` was duplicated.',
      match.type,
    );
    seenTypes.add(match.type);

    const belongsToUnion = outputType
      .getTypes()
      .some(type => type.name === match.type);
    if (!belongsToUnion) {
      throw new Error(
        `RelayMatchTransform: Unsupported type '${match.type.toString()}' in ` +
          `the list of matches in the @${MATCH_DIRECTIVE_NAME}. Type ` +
          `"${match.type.toString()}" does not belong to the union ` +
          `"${outputType.toString()}".`,
      );
    }
    return match.type;
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
