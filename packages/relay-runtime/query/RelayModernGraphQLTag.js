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

import type {
  ReaderFragment,
  ReaderRefetchableFragment,
  ReaderPaginationFragment,
  ReaderInlineDataFragment,
} from '../util/ReaderNode';
import type {ConcreteRequest} from '../util/RelayConcreteNode';

// The type of a graphql`...` tagged template expression.
export type GraphQLTaggedNode =
  | ReaderFragment
  | ConcreteRequest
  | (() => ReaderFragment | ConcreteRequest)
  | {
      modern: () => ReaderFragment | ConcreteRequest,
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
  const fn =
    typeof taggedNode === 'function'
      ? taggedNode
      : typeof taggedNode.modern === 'function'
      ? taggedNode.modern
      : null;
  // Support for classic raw nodes (used in test mock)
  if (fn === null) {
    return (taggedNode: any);
  }
  const data: any = fn();
  // Support for languages that work (best) with ES6 modules, such as TypeScript.
  return data.default ? data.default : data;
}

function isFragment(node: GraphQLTaggedNode): boolean {
  const fragment = getNode(node);
  return (
    typeof fragment === 'object' &&
    fragment !== null &&
    fragment.kind === RelayConcreteNode.FRAGMENT
  );
}

function isRequest(node: GraphQLTaggedNode): boolean {
  const request = getNode(node);
  return (
    typeof request === 'object' &&
    request !== null &&
    request.kind === RelayConcreteNode.REQUEST
  );
}

function isInlineDataFragment(node: GraphQLTaggedNode): boolean {
  const fragment = getNode(node);
  return (
    typeof fragment === 'object' &&
    fragment !== null &&
    fragment.kind === RelayConcreteNode.INLINE_DATA_FRAGMENT
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

function getPaginationFragment(
  taggedNode: GraphQLTaggedNode,
): ReaderPaginationFragment | null {
  const fragment = getFragment(taggedNode);
  const refetch = fragment.metadata?.refetch;
  const connection = refetch?.connection;
  if (
    refetch === null ||
    typeof refetch !== 'object' ||
    connection === null ||
    typeof connection !== 'object'
  ) {
    return null;
  }
  return (fragment: any);
}

function getRefetchableFragment(
  taggedNode: GraphQLTaggedNode,
): ReaderRefetchableFragment | null {
  const fragment = getFragment(taggedNode);
  const refetch = fragment.metadata?.refetch;
  if (refetch === null || typeof refetch !== 'object') {
    return null;
  }
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

function getInlineDataFragment(
  taggedNode: GraphQLTaggedNode,
): ReaderInlineDataFragment {
  const fragment = getNode(taggedNode);
  invariant(
    isInlineDataFragment(fragment),
    'RelayModernGraphQLTag: Expected an inline data fragment, got `%s`.',
    JSON.stringify(fragment),
  );
  return (fragment: any);
}

module.exports = {
  getFragment,
  getPaginationFragment,
  getRefetchableFragment,
  getRequest,
  getInlineDataFragment,
  graphql,
  isFragment,
  isRequest,
  isInlineDataFragment,
};
