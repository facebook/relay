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

// TODO: typegen for plural output type
import type {Todo__blocked_by$normalization as ReturnType} from './__generated__/Todo__blocked_by$normalization.graphql';
import type {TodoBlockedByResolverFragment$key} from './__generated__/TodoBlockedByResolverFragment.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver Todo.blocked_by: [Todo]
 * @rootFragment TodoBlockedByResolverFragment
 */
function blocked_by(
  rootKey: TodoBlockedByResolverFragment$key,
): ReadonlyArray<ReturnType> {
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

module.exports = {
  blocked_by,
};
