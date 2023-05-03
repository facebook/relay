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
import type {TodoModelCapitalizedID$key} from './__generated__/TodoModelCapitalizedID.graphql';
import type {TodoModelCapitalizedIDLegacy$key} from './__generated__/TodoModelCapitalizedIDLegacy.graphql';
import type {TodoDescription} from './TodoDescription';
import type {ConcreteClientEdgeResolverReturnType} from 'relay-runtime';
import type {TodoItem} from 'relay-runtime/store/__tests__/resolvers/ExampleTodoStore';

const {readFragment} = require('../../ResolverFragments');
const {createTodoDescription} = require('./TodoDescription');
const {graphql} = require('relay-runtime');
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
 * @RelayResolver TodoModel.capitalized_id: String
 * @rootFragment TodoModelCapitalizedID
 *
 * A resolver on a model type that reads its own rootFragment
 */
function capitalized_id(key: TodoModelCapitalizedID$key): ?string {
  const todo = readFragment(
    graphql`
      fragment TodoModelCapitalizedID on TodoModel {
        id
      }
    `,
    key,
  );
  return todo.id.toUpperCase();
}

/**
 * @RelayResolver
 * @fieldName capitalized_id_legacy
 * @onType TodoModel
 * @rootFragment TodoModelCapitalizedIDLegacy
 *
 * Like `capitalized_id`, but implemented using the non-terse legacy syntax
 */
function capitalized_id_legacy(key: TodoModelCapitalizedIDLegacy$key): ?string {
  const todo = readFragment(
    graphql`
      fragment TodoModelCapitalizedIDLegacy on TodoModel {
        id
      }
    `,
    key,
  );
  return todo.id.toUpperCase();
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
  capitalized_id,
  capitalized_id_legacy,
  todo_model_null,
  TodoModel,
  description,
  fancy_description,
  many_fancy_descriptions,
  live_todo_description,
};
