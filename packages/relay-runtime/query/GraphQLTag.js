/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

import type {
  ReaderFragment,
  ReaderInlineDataFragment,
  ReaderPaginationFragment,
  ReaderRefetchableFragment,
} from '../util/ReaderNode';
import type {
  ConcreteRequest,
  ConcreteUpdatableQuery,
} from '../util/RelayConcreteNode';

const RelayConcreteNode = require('../util/RelayConcreteNode');
const invariant = require('invariant');
const warning = require('warning');

// The type of a graphql`...` tagged template expression.
export type GraphQLTaggedNode =
  | ReaderFragment
  | ReaderInlineDataFragment
  | ConcreteRequest
  | ConcreteUpdatableQuery
  | {
      // This is this case when we `require()` a generated ES6 module
      default:
        | ReaderFragment
        | ReaderInlineDataFragment
        | ConcreteRequest
        | ConcreteUpdatableQuery,
      ...
    };

/**
 * Runtime function to correspond to the `graphql` tagged template function.
 * All calls to this function should be transformed by the plugin.
 */
function graphql(strings: ReadonlyArray<string>): any {
  invariant(
    false,
    'graphql: Unexpected invocation at runtime. Either the Babel transform ' +
      'was not set up, or it failed to identify this call site. Make sure it ' +
      'is being used verbatim as `graphql`. Note also that there cannot be ' +
      'a space between graphql and the backtick that follows.',
  );
}

function getNode(
  taggedNode: GraphQLTaggedNode,
):
  | ReaderFragment
  | ReaderInlineDataFragment
  | ConcreteRequest
  | ConcreteUpdatableQuery {
  let node = taggedNode;
  if (typeof node === 'function') {
    node = node() as ReaderFragment | ConcreteRequest;
    warning(
      false,
      'RelayGraphQLTag: node `%s` unexpectedly wrapped in a function.',
      node.kind === 'Fragment' ? node.name : node.operation.name,
    );
  } else if (node.default) {
    // Support for languages that work (best) with ES6 modules, such as TypeScript.
    node = node.default;
  }
  return node;
}

function isFragment(node: GraphQLTaggedNode): boolean {
  const fragment = getNode(node);
  return (
    typeof fragment === 'object' &&
    /* $FlowFixMe[invalid-compare] Error discovered during Constant Condition
     * roll out. See https://fburl.com/workplace/5whu3i34. */
    fragment !== null &&
    fragment.kind === RelayConcreteNode.FRAGMENT
  );
}

function isRequest(node: GraphQLTaggedNode): boolean {
  const request = getNode(node);
  return (
    typeof request === 'object' &&
    /* $FlowFixMe[invalid-compare] Error discovered during Constant Condition
     * roll out. See https://fburl.com/workplace/5whu3i34. */
    request !== null &&
    request.kind === RelayConcreteNode.REQUEST
  );
}

function isUpdatableQuery(node: GraphQLTaggedNode): boolean {
  const updatableQuery = getNode(node);
  return (
    typeof updatableQuery === 'object' &&
    /* $FlowFixMe[invalid-compare] Error discovered during Constant Condition
     * roll out. See https://fburl.com/workplace/5whu3i34. */
    updatableQuery !== null &&
    updatableQuery.kind === RelayConcreteNode.UPDATABLE_QUERY
  );
}

function isInlineDataFragment(node: GraphQLTaggedNode): boolean {
  const fragment = getNode(node);
  return (
    typeof fragment === 'object' &&
    /* $FlowFixMe[invalid-compare] Error discovered during Constant Condition
     * roll out. See https://fburl.com/workplace/5whu3i34. */
    fragment !== null &&
    fragment.kind === RelayConcreteNode.INLINE_DATA_FRAGMENT
  );
}

function getFragment(taggedNode: GraphQLTaggedNode): ReaderFragment {
  const fragment = getNode(taggedNode);
  invariant(
    isFragment(fragment),
    'GraphQLTag: Expected a fragment, got `%s`.',
    JSON.stringify(fragment),
  );
  return fragment as any;
}

function getPaginationFragment(
  taggedNode: GraphQLTaggedNode,
): ReaderPaginationFragment | null {
  const fragment = getFragment(taggedNode);
  const refetch = fragment.metadata?.refetch;
  const connection = refetch?.connection;
  if (
    /* $FlowFixMe[invalid-compare] Error discovered during Constant Condition
     * roll out. See https://fburl.com/workplace/5whu3i34. */
    refetch === null ||
    typeof refetch !== 'object' ||
    connection === null ||
    typeof connection !== 'object'
  ) {
    return null;
  }
  return fragment as any;
}

function getRefetchableFragment(
  taggedNode: GraphQLTaggedNode,
): ReaderRefetchableFragment | null {
  const fragment = getFragment(taggedNode);
  const refetch = fragment.metadata?.refetch;
  /* $FlowFixMe[invalid-compare] Error discovered during Constant Condition
   * roll out. See https://fburl.com/workplace/5whu3i34. */
  if (refetch === null || typeof refetch !== 'object') {
    return null;
  }
  return fragment as any;
}

function getRequest(taggedNode: GraphQLTaggedNode): ConcreteRequest {
  const request = getNode(taggedNode);
  invariant(
    isRequest(request),
    'GraphQLTag: Expected a request, got `%s`.',
    JSON.stringify(request),
  );
  return request as any;
}

function getUpdatableQuery(
  taggedNode: GraphQLTaggedNode,
): ConcreteUpdatableQuery {
  const updatableQuery = getNode(taggedNode);
  invariant(
    isUpdatableQuery(updatableQuery),
    'GraphQLTag: Expected a request, got `%s`.',
    JSON.stringify(updatableQuery),
  );
  return updatableQuery as any;
}

function getInlineDataFragment(
  taggedNode: GraphQLTaggedNode,
): ReaderInlineDataFragment {
  const fragment = getNode(taggedNode);
  invariant(
    isInlineDataFragment(fragment),
    'GraphQLTag: Expected an inline data fragment, got `%s`.',
    JSON.stringify(fragment),
  );
  return fragment as any;
}

module.exports = {
  getFragment,
  getInlineDataFragment,
  getNode,
  getPaginationFragment,
  getRefetchableFragment,
  getRequest,
  getUpdatableQuery,
  graphql,
  isFragment,
  isInlineDataFragment,
  isRequest,
  isUpdatableQuery,
};
