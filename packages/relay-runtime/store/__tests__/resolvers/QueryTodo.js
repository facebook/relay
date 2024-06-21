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

import type {Query__todo$normalization as ReturnType} from './__generated__/Query__todo$normalization.graphql';
import type {LiveState} from 'relay-runtime';

const {
  Selectors,
  TODO_STORE,
} = require('relay-runtime/store/__tests__/resolvers/ExampleTodoStore');
/**
 * @RelayResolver Query.todo(todoID: ID!): Todo
 * @live
 */
function todo(args: {todoID: string}): LiveState<?ReturnType> {
  return {
    read() {
      const todo = Selectors.getTodo(TODO_STORE.getState(), args.todoID);
      if (todo != null) {
        return {
          todo_id: String(todo.todoID),
        };
      } else {
        return null;
      }
    },
    subscribe(cb) {
      return TODO_STORE.subscribe(args.todoID, cb);
    },
  };
}

module.exports = {
  todo,
};
