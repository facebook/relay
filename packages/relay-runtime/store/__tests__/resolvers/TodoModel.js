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
import type {TodoDescription} from './TodoDescription';

const {createTodoDescription} = require('./TodoDescription');

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

/**
 * @RelayResolver TodoModel.description: String
 */
function description(model: ?TodoItem): ?string {
  return model?.description;
}

/**
 * @RelayResolver TodoModel.fancy_description: TodoDescription
 */
function fancy_description(model: ?TodoItem): ?TodoDescription {
  if (model == null) {
    return null;
  }
  return createTodoDescription(model.description, model.isCompleted);
}

module.exports = {
  TodoModel,
  description,
  fancy_description,
};
