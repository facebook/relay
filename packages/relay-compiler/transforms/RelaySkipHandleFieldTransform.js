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

const {CompilerContext, IRTransformer} = require('graphql-compiler');

import type {Field} from 'graphql-compiler';

/**
 * A transform that removes field `handles`. Intended for use when e.g.
 * printing queries to send to a GraphQL server.
 */
function relaySkipHandleFieldTransform(
  context: CompilerContext,
): CompilerContext {
  return IRTransformer.transform(context, {
    LinkedField: visitField,
    MatchField: visitField,
    ScalarField: visitField,
  });
}

function visitField<F: Field>(field: F): ?F {
  const transformedNode = this.traverse(field);
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
