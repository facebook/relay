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

const {RELAY} = require('./RelayRelayDirectiveTransform');
const {GraphQLObjectType, GraphQLUnionType} = require('graphql');
const {
  CompilerContext,
  IRTransformer,
  getLiteralArgumentValues,
} = require('graphql-compiler');

import type {LinkedField, MatchField, Selection} from 'graphql-compiler';
import type {GraphQLCompositeType} from 'graphql';

const SUPPORTED_ARGUMENT_NAME = 'supported';

type DataDependencyMatch = {|
  +type: GraphQLCompositeType,
  +fragment: string,
  +module: string,
|};

function relayMatchTransform(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(context, {
    LinkedField: visitField,
  });
}

function getMatchSelections(
  matches: Array<DataDependencyMatch>,
): Array<Selection> {
  const seenTypes = new Set<GraphQLCompositeType>();
  return matches.map(match => {
    invariant(
      !seenTypes.has(match.type),
      'RelayMatchTransform: Each "match" type has to appear at-most once. Type `%s` was duplicated.',
      match.type,
    );
    seenTypes.add(match.type);
    return {
      kind: 'MatchFragmentSpread',
      type: match.type,
      module: match.module,
      args: [],
      directives: [],
      metadata: null,
      name: match.fragment,
    };
  });
}

function visitField(
  field: LinkedField,
  state,
  parent?: mixed,
): LinkedField | MatchField {
  const transformedNode: LinkedField = this.traverse(field, state);
  if (typeof parent !== 'object') {
    return transformedNode;
  }

  const schema = this.getContext().serverSchema;
  const parentType = schema.getType(parent?.type);
  if (!(parentType instanceof GraphQLObjectType)) {
    return transformedNode;
  }

  const relayDirective = transformedNode.directives.find(
    ({name}) => name === RELAY,
  );
  if (relayDirective == null) {
    return transformedNode;
  }

  const argValues = getLiteralArgumentValues(relayDirective.args);
  if (argValues.match == null) {
    return transformedNode;
  }

  invariant(
    Array.isArray(argValues.match) && argValues.match.length > 0,
    'RelayMatchTransform: You are trying to use @relay(match) directive with an empty list of matches. @relay(match) argument should be a non-empty array of objects {type, fragment, module}.',
  );

  const currentField = parentType.getFields()[field.name];
  const supportedArg = currentField.args.find(
    ({name}) => SUPPORTED_ARGUMENT_NAME,
  );

  invariant(
    supportedArg != null && supportedArg.type.toString() === '[String!]!',
    'RelayMatchTransform: @relay(match) used on an incompatible field `%s`. @relay(match) may only be used with fields that can accept `%s` argument with type `[String!]!`.',
    field.name,
    SUPPORTED_ARGUMENT_NAME,
  );

  const outputType = transformedNode.type;
  invariant(
    outputType instanceof GraphQLUnionType,
    'RelayMatchTransform: You are trying to apply @relay(match) directive to a filed "%s" that has unsupported output type. "%s" output type should be union type of object types.',
    field.name,
    transformedNode.name,
  );

  const {alias, name, handles, metadata} = transformedNode;
  const result: MatchField = {
    alias,
    name,
    handles,
    metadata,
    type: outputType,
    kind: 'MatchField',
    directives: transformedNode.directives.filter(
      directive => directive !== relayDirective,
    ),
    selections: getMatchSelections(argValues.match),
    args: [
      {
        kind: 'Argument',
        name: SUPPORTED_ARGUMENT_NAME,
        type: supportedArg.type,
        value: {
          kind: 'Literal',
          metadata: null,
          value: argValues.match.map(match => {
            const belongToUnion = outputType
              .getTypes()
              .some(type => type.name === match.type);

            invariant(
              belongToUnion,
              'RelayMatchTransform: Unsupported type in the list of matches in the @relay(match). Type "%s" does not belong to the union "%s"',
              match.type,
              outputType,
            );
            return match.type;
          }),
        },
        metadata: null,
      },
    ],
  };

  return result;
}

module.exports = {
  transform: relayMatchTransform,
};
