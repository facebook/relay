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

const IRTransformer = require('../core/GraphQLIRTransformer');

import type CompilerContext from '../core/GraphQLCompilerContext';
import type {Field} from '../core/GraphQLIR';

/**
 * A transform that removes field `handles`. Intended for use when e.g.
 * printing queries to send to a GraphQL server.
 */
function relaySkipHandleFieldTransform(
  context: CompilerContext,
): CompilerContext {
  return IRTransformer.transform(context, {
    LinkedField: visitField,
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
