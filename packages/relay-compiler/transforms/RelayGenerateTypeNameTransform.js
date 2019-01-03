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
const SchemaUtils = require('../core/GraphQLSchemaUtils');

const {hasUnaliasedSelection} = require('./RelayTransformUtils');
const {assertLeafType} = require('graphql');

import type {LinkedField, MatchField, ScalarField} from '../core/GraphQLIR';

const {isAbstractType} = SchemaUtils;

const TYPENAME_KEY = '__typename';
const STRING_TYPE = 'String';

type State = {
  typenameField: ScalarField,
};

/**
 * A transform that adds `__typename` field on any `LinkedField` of a union or
 * interface type where there is no unaliased `__typename` selection.
 */
function relayGenerateTypeNameTransform(
  context: CompilerContext,
): CompilerContext {
  const stringType = assertLeafType(context.serverSchema.getType(STRING_TYPE));
  const typenameField: ScalarField = {
    kind: 'ScalarField',
    alias: (null: ?string),
    args: [],
    directives: [],
    handles: null,
    loc: {kind: 'Generated'},
    metadata: null,
    name: TYPENAME_KEY,
    type: stringType,
  };
  const state = {
    typenameField,
  };
  return IRTransformer.transform(
    context,
    {
      LinkedField: visitLinkedOrMatchField,
      MatchField: visitLinkedOrMatchField,
    },
    () => state,
  );
}

function visitLinkedOrMatchField<T: LinkedField | MatchField>(
  field: T,
  state: State,
): T {
  const transformedNode = this.traverse(field, state);
  if (
    isAbstractType(transformedNode.type) &&
    !hasUnaliasedSelection(transformedNode, TYPENAME_KEY)
  ) {
    return {
      ...transformedNode,
      selections: [state.typenameField, ...transformedNode.selections],
    };
  }
  return transformedNode;
}

module.exports = {
  transform: relayGenerateTypeNameTransform,
};
