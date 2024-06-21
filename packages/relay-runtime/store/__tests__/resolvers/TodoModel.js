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
import type {TodoDescription} from './TodoDescription';
import type {ConcreteClientEdgeResolverReturnType} from 'relay-runtime';
import type {TodoItem} from 'relay-runtime/store/__tests__/resolvers/ExampleTodoStore';

const {createTodoDescription} = require('./TodoDescription');
const {
  Selectors,
  TODO_STORE,
} = require('relay-runtime/store/__tests__/resolvers/ExampleTodoStore');

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

/**
 * @RelayResolver TodoModel.many_fancy_descriptions: [TodoDescription]
 */
function many_fancy_descriptions(
  model: ?TodoItem,
): $ReadOnlyArray<TodoDescription> {
  if (model == null) {
    return [];
  }

  return [createTodoDescription(model.description, model.isCompleted)];
}

/**
 * @RelayResolver Query.todo_model_null: TodoModel
 */
function todo_model_null(): ?ConcreteClientEdgeResolverReturnType<> {
  return null;
}

/**
 * @RelayResolver Query.live_todo_description(todoID: ID!): TodoDescription
 * @live
 *
 */
function live_todo_description(args: {
  todoID: string,
}): LiveState<?TodoDescription> {
  return {
    read() {
      const todo = Selectors.getTodo(TODO_STORE.getState(), args.todoID);
      return todo
        ? createTodoDescription(todo.description, todo.isCompleted)
        : null;
    },
    subscribe(cb) {
      return TODO_STORE.subscribe(args.todoID, cb);
    },
  };
}

module.exports = {
  todo_model_null,
  TodoModel,
  description,
  fancy_description,
  many_fancy_descriptions,
  live_todo_description,
};
