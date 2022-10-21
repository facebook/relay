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

import type {LiveState} from '../../experimental-live-resolvers/LiveResolverStore';

const {
  TODO_STORE,
  Selectors,
} = require('relay-runtime/store/__tests__/resolvers/ExampleTodoStore');

import type {TodoItem} from 'relay-runtime/store/__tests__/resolvers/ExampleTodoStore';

/**
 * @RelayResolver TodoModel
 * @live
 */
function TodoModel(id: string): LiveState<?TodoItem> {
  return {
    read() {
      return Selectors.getTodo(TODO_STORE.getState(), id);
    },
    subscribe(cb) {
      return TODO_STORE.subscribe(id, cb);
    },
  };
}

module.exports = {
  TodoModel,
};
