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

import type {PayloadError} from '../network/RelayNetworkTypes';

// $FlowFixMe[recursive-definition]
const SELF: Self = Symbol('$SELF');

export opaque type Self = typeof SELF;

export type TRelayFieldErrorForDisplay = $ReadOnly<{
  path?: $ReadOnlyArray<string | number>,
  severity?: 'CRITICAL' | 'ERROR' | 'WARNING',
}>;

// We display a subset of the TRelayFieldError to the user. Removing the message by default.
export type TRelayFieldError = $ReadOnly<{
  ...TRelayFieldErrorForDisplay,
  message: string,
}>;

/**
 * This is a highly-specialized data structure that is designed
 * to store the field errors of a GraphQL response in such a way
 * that they can be performantly retrieved during normalization.
 *
 * In particular, the trie can be constructed in O(N) time, where
 * N is the number of errors, so long as the depth of the GraphQL
 * response data, and therefore the expected length of any error
 * paths, is relatively small and constant.
 *
 * As we recursively traverse the data in the GraphQL response
 * during normalization, we can get the sub trie for any field
 * in O(1) time.
 */
export opaque type RelayErrorTrie = Map<
  string | number | Self,
  RelayErrorTrie | Array<Omit<TRelayFieldError, 'path'>>,
>;

function buildErrorTrie(
  errors: ?$ReadOnlyArray<PayloadError>,
): RelayErrorTrie | null {
  if (errors == null) {
    return null;
  }

  const trie: $NonMaybeType<RelayErrorTrie> = new Map();
  // eslint-disable-next-line no-unused-vars
  ERRORS: for (const {path, locations: _, ...error} of errors) {
    if (path == null) {
      continue;
    }
    const {length} = path;
    if (length === 0) {
      continue;
    }
    const lastIndex = length - 1;
    let currentTrie = trie;
    for (let index = 0; index < lastIndex; index++) {
      const key = path[index];
      const existingValue = currentTrie.get(key);
      if (existingValue instanceof Map) {
        currentTrie = existingValue;
        continue;
      }
      const newValue: RelayErrorTrie = new Map();
      if (Array.isArray(existingValue)) {
        newValue.set(SELF, existingValue);
      }
      currentTrie.set(key, newValue);
      currentTrie = newValue;
    }
    let lastKey: string | number | symbol = path[lastIndex];
    let container = currentTrie.get(lastKey);
    if (container instanceof Map) {
      currentTrie = container;
      container = currentTrie.get(lastKey);
      lastKey = SELF;
    }
    if (Array.isArray(container)) {
      container.push(error);
    } else {
      currentTrie.set(lastKey, [error]);
    }
  }
  return trie;
}

function getErrorsByKey(
  trie: RelayErrorTrie,
  key: string | number,
): $ReadOnlyArray<TRelayFieldError> | null {
  const value = trie.get(key);
  if (value == null) {
    return null;
  }
  if (Array.isArray(value)) {
    return value;
  }
  const errors: Array<
    $ReadOnly<{
      message: string,
      path?: Array<string | number>,
      severity?: 'CRITICAL' | 'ERROR' | 'WARNING',
    }>,
  > = [];
  recursivelyCopyErrorsIntoArray(value, errors);
  return errors;
}

function recursivelyCopyErrorsIntoArray(
  trieOrSet: RelayErrorTrie,
  errors: Array<
    $ReadOnly<{
      message: string,
      path?: Array<string | number>,
      severity?: 'CRITICAL' | 'ERROR' | 'WARNING',
    }>,
  >,
): void {
  for (const [childKey, value] of trieOrSet) {
    const oldLength = errors.length;
    if (Array.isArray(value)) {
      errors.push(...value);
    } else {
      recursivelyCopyErrorsIntoArray(value, errors);
    }
    if (childKey === SELF) {
      continue;
    }
    const newLength = errors.length;
    for (let index = oldLength; index < newLength; index++) {
      const error = errors[index];
      if (error.path == null) {
        errors[index] = {
          ...error,
          path: [childKey],
        };
      } else {
        error.path.unshift(childKey);
      }
    }
  }
}

function getNestedErrorTrieByKey(
  trie: RelayErrorTrie,
  key: string | number,
): RelayErrorTrie | null {
  const value = trie.get(key);
  if (value instanceof Map) {
    return value;
  }
  return null;
}

module.exports = ({
  SELF,
  buildErrorTrie,
  getNestedErrorTrieByKey,
  getErrorsByKey,
}: {
  SELF: typeof SELF,
  buildErrorTrie: typeof buildErrorTrie,
  getNestedErrorTrieByKey: typeof getNestedErrorTrieByKey,
  getErrorsByKey: typeof getErrorsByKey,
});
