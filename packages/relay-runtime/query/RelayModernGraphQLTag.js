/**
 * Copyright (c) Facebook, Inc. and its affiliates.
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

import type {ConcreteRequest} from '../util/RelayConcreteNode';
import type {ReaderFragment} from '../util/ReaderNode';
import type {
  ConcreteFragmentDefinition,
  ConcreteOperationDefinition,
} from 'react-relay/classic/query/ConcreteQuery';
import typeof RelayQL from 'react-relay/classic/query/RelayQL';

// The type of a graphql`...` tagged template expression.
export type GraphQLTaggedNode =
  | (() => ReaderFragment | ConcreteRequest)
  | {
      modern: () => ReaderFragment | ConcreteRequest,
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
  const data: any = fn();
  // Support for languages that work (best) with ES6 modules, such as TypeScript.
  return data.default ? data.default : data;
}

function isFragment(node: GraphQLTaggedNode) {
  const fragment = getNode(node);
  return (
    typeof fragment === 'object' &&
    fragment !== null &&
    fragment.kind === RelayConcreteNode.FRAGMENT
  );
}

function isRequest(node: GraphQLTaggedNode) {
  const request = getNode(node);
  return (
    typeof request === 'object' &&
    request !== null &&
    request.kind === RelayConcreteNode.REQUEST
  );
}

function getFragment(taggedNode: GraphQLTaggedNode): ReaderFragment {
  const fragment = getNode(taggedNode);
  invariant(
    isFragment(fragment),
    'RelayModernGraphQLTag: Expected a fragment, got `%s`.',
    JSON.stringify(fragment),
  );
  return (fragment: any);
}

function getRequest(taggedNode: GraphQLTaggedNode): ConcreteRequest {
  const request = getNode(taggedNode);
  invariant(
    isRequest(request),
    'RelayModernGraphQLTag: Expected a request, got `%s`.',
    JSON.stringify(request),
  );
  return (request: any);
}

module.exports = {
  getFragment,
  getRequest,
  graphql,
  isFragment,
  isRequest,
};
