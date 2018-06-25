/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const RelayConcreteNode = require('../util/RelayConcreteNode');

const invariant = require('invariant');

import type {ConcreteFragment, RequestNode} from '../util/RelayConcreteNode';
import type {
  ConcreteFragmentDefinition,
  ConcreteOperationDefinition,
} from 'react-relay/classic/query/ConcreteQuery';
import typeof RelayQL from 'react-relay/classic/query/RelayQL';

// The type of a graphql`...` tagged template expression.
export type GraphQLTaggedNode =
  | (() => ConcreteFragment | RequestNode)
  | {
      modern: () => ConcreteFragment | RequestNode,
      classic: RelayQL =>
        | ConcreteFragmentDefinition
        | ConcreteOperationDefinition,
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
      fragment.kind === RelayConcreteNode.FRAGMENT,
    'RelayModernGraphQLTag: Expected a fragment, got `%s`.',
    JSON.stringify(fragment),
  );
  return (fragment: any);
}

function getRequest(taggedNode: GraphQLTaggedNode): RequestNode {
  const request = getNode(taggedNode);
  invariant(
    typeof request === 'object' &&
      request !== null &&
      (request.kind === RelayConcreteNode.REQUEST ||
        request.kind === RelayConcreteNode.BATCH_REQUEST),
    'RelayModernGraphQLTag: Expected a request, got `%s`.',
    JSON.stringify(request),
  );
  return (request: any);
}

module.exports = {
  getFragment,
  getRequest,
  graphql,
};
