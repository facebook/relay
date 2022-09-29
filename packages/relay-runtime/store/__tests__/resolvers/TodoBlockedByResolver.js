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

const {readFragment} = require('relay-runtime/store/ResolverFragments');
const {graphql} = require('relay-runtime');

// TODO: typegen for plural output type
import type {Todo__blocked_by$normalization as ReturnType} from './__generated__/Todo__blocked_by$normalization.graphql';
import type {TodoBlockedByResolverFragment$key} from './__generated__/TodoBlockedByResolverFragment.graphql';

/**
 * @RelayResolver
 * @onType Todo
 * @rootFragment TodoBlockedByResolverFragment
 * @fieldName blocked_by
 * @outputType [Todo]
 */
function TodoBlockedByResolver(
  rootKey: TodoBlockedByResolverFragment$key,
): $ReadOnlyArray<ReturnType> {
  const data = readFragment(
    graphql`
      fragment TodoBlockedByResolverFragment on Todo {
        self
      }
    `,
    rootKey,
  );
  const blockedBy = data.self?.blockedBy;
  if (blockedBy == null) {
    return [];
  } else {
    const result = [];
    for (const todoID of blockedBy.values()) {
      result.push({
        todo_id: String(todoID),
      });
    }
    return result;
  }
}

module.exports = TodoBlockedByResolver;
