/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelaySkipHandleFieldTransform
 * @flow
 * @format
 */

'use strict';

const {CompilerContext, IRTransformer} = require('graphql-compiler');

import type {LinkedField, ScalarField} from 'graphql-compiler';
import type {GraphQLSchema} from 'graphql';

type State = true;

/**
 * A transform that removes field `handles`. Intended for use when e.g.
 * printing queries to send to a GraphQL server.
 */
function relaySkipHandleFieldTransform(
  context: CompilerContext,
  schema: GraphQLSchema,
): CompilerContext {
  return IRTransformer.transform(
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

module.exports = {
  transform: relaySkipHandleFieldTransform,
};
