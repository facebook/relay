/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

'use strict';

import type {Query__many_todos$normalization as ReturnType} from './__generated__/Query__many_todos$normalization.graphql';

/**
 * @RelayResolver
 * @onType Query
 * @fieldName many_todos(todo_ids: [ID]!)
 * @outputType [Todo]
 */
function QueryManyTodos(args: {
  todo_ids: $ReadOnlyArray<?string>,
}): $ReadOnlyArray<ReturnType | null> {
  return args.todo_ids.map(todo_id => {
    if (todo_id == null) {
      return null;
    }
    return {
      todo_id,
    };
  });
}

module.exports = QueryManyTodos;
