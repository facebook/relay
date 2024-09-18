/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {Direction, ReaderFragment} from 'relay-runtime';

const invariant = require('invariant');
const {ConnectionInterface, getValueAtPath} = require('relay-runtime');

function getConnectionState(
  direction: Direction,
  fragmentNode: ReaderFragment,
  fragmentData: mixed,
  connectionPathInFragmentData: $ReadOnlyArray<string | number>,
): {
  cursor: ?string,
  hasMore: boolean,
} {
  const {
    EDGES,
    PAGE_INFO,
    HAS_NEXT_PAGE,
    HAS_PREV_PAGE,
    END_CURSOR,
    START_CURSOR,
  } = ConnectionInterface.get();
  const connection = getValueAtPath(fragmentData, connectionPathInFragmentData);
  if (connection == null) {
    return {cursor: null, hasMore: false};
  }

  invariant(
    typeof connection === 'object',
    'Relay: Expected connection in fragment `%s` to have been `null`, or ' +
      'a plain object with %s and %s properties. Instead got `%s`.',
    fragmentNode.name,
    EDGES,
    PAGE_INFO,
    connection,
  );

  const edges = connection[EDGES];
  const pageInfo = connection[PAGE_INFO];
  if (edges == null || pageInfo == null) {
    return {cursor: null, hasMore: false};
  }

  invariant(
    Array.isArray(edges),
    'Relay: Expected connection in fragment `%s` to have a plural `%s` field. ' +
      'Instead got `%s`.',
    fragmentNode.name,
    EDGES,
    edges,
  );
  invariant(
    typeof pageInfo === 'object',
    'Relay: Expected connection in fragment `%s` to have a `%s` field. ' +
      'Instead got `%s`.',
    fragmentNode.name,
    PAGE_INFO,
    pageInfo,
  );

  const cursor =
    direction === 'forward'
      ? pageInfo[END_CURSOR] ?? null
      : pageInfo[START_CURSOR] ?? null;
  invariant(
    cursor === null || typeof cursor === 'string',
    'Relay: Expected page info for connection in fragment `%s` to have a ' +
      'valid `%s`. Instead got `%s`.',
    fragmentNode.name,
    START_CURSOR,
    cursor,
  );

  let hasMore;
  if (direction === 'forward') {
    hasMore = cursor != null && pageInfo[HAS_NEXT_PAGE] === true;
  } else {
    hasMore = cursor != null && pageInfo[HAS_PREV_PAGE] === true;
  }

  return {cursor, hasMore};
}

module.exports = getConnectionState;
