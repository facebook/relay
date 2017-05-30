/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelaySkipHandleFieldTransform
 * @flow
 * @format
 */

'use strict';

const RelayCompilerContext = require('RelayCompilerContext');
const RelayIRTransformer = require('RelayIRTransformer');

import type {LinkedField, ScalarField} from 'RelayIR';
import type {GraphQLSchema} from 'graphql';

type State = true;

/**
 * A transform that removes field `handles`. Intended for use when e.g.
 * printing queries to send to a GraphQL server.
 */
function transform(
  context: RelayCompilerContext,
  schema: GraphQLSchema,
): RelayCompilerContext {
  return RelayIRTransformer.transform(
    context,
    {
      LinkedField: visitField,
      ScalarField: visitField,
    },
    () => true,
  );
}

function visitField<F: LinkedField | ScalarField>(field: F, state: State): ?F {
  const transformedNode = this.traverse(field, state);
  if (transformedNode.handles) {
    return {
      ...transformedNode,
      handles: null,
    };
  }
  return transformedNode;
}

module.exports = {transform};
