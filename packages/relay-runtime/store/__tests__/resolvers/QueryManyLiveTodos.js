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
import type {LiveState} from 'relay-runtime';

const {
  Selectors,
  TODO_STORE,
} = require('relay-runtime/store/__tests__/resolvers/ExampleTodoStore');

/**
 * @RelayResolver Query.many_live_todos: [Todo]
 * @live
 */
function many_live_todos(): LiveState<ReadonlyArray<{todo_id: string}>> {
  return {
    read() {
      return Selectors.getTodoIDs(TODO_STORE.getState()).map(id => ({
        todo_id: id,
      }));
    },
    subscribe(cb) {
      return TODO_STORE.subscribe(null, cb);
    },
  };
}

module.exports = {
  many_live_todos,
};
