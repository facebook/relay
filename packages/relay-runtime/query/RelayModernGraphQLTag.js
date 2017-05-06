/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayModernGraphQLTag
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');

import type {
  ConcreteFragmentDefinition,
  ConcreteOperationDefinition,
} from 'ConcreteQuery';
import type {ConcreteBatch, ConcreteFragment} from 'RelayConcreteNode';

// The type of a graphql`...` tagged template expression.
export type GraphQLTaggedNode =
  | (() => ConcreteFragment | ConcreteBatch)
  | {
      modern: () => ConcreteFragment | ConcreteBatch,
      classic: () => ConcreteFragmentDefinition | ConcreteOperationDefinition,
    };

/**
 * Runtime function to correspond to the `graphql` tagged template function.
 * All calls to this function should be transformed by the plugin.
 */
function graphql(strings: Array<string>): GraphQLTaggedNode {
  invariant(
    false,
    'graphql: Unexpected invocation at runtime. Either the Babel transform ' +
      'was not set up, or it failed to identify this call site. Make sure it ' +
      'is being used verbatim as `graphql`.',
  );
}

/**
 * Variant of the `graphql` tag that enables experimental features.
 */
graphql.experimental = function(strings: Array<string>): GraphQLTaggedNode {
  invariant(
    false,
    'graphql.experimental: Unexpected invocation at runtime. Either the ' +
      'Babel transform was not set up, or it failed to identify this call ' +
      'site. Make sure it is being used verbatim as `graphql`.',
  );
};

function getNode(taggedNode) {
  const fn = typeof taggedNode === 'function' ? taggedNode : taggedNode.modern;
  // Support for classic raw nodes (used in test mock)
  if (typeof fn !== 'function') {
    return (taggedNode: any);
  }
  return fn();
}

function getFragment(taggedNode: GraphQLTaggedNode): ConcreteFragment {
  const fragment = getNode(taggedNode);
  invariant(
    typeof fragment === 'object' &&
      fragment !== null &&
      fragment.kind === 'Fragment',
    'RelayModernGraphQLTag: Expected a fragment, got `%s`.',
    JSON.stringify(fragment),
  );
  return (fragment: any);
}

function getOperation(taggedNode: GraphQLTaggedNode): ConcreteBatch {
  const operation = getNode(taggedNode);
  invariant(
    typeof operation === 'object' &&
      operation !== null &&
      operation.kind === 'Batch',
    'RelayModernGraphQLTag: Expected an operation, got `%s`.',
    JSON.stringify(operation),
  );
  return (operation: any);
}

module.exports = {
  getFragment,
  getOperation,
  graphql,
};
