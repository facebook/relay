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

import type {LogEvent} from '../../RelayStoreTypes';

export opaque type TodoID: string = string;

export type TodoItem = {
  todoID: TodoID,
  description: string,
  isCompleted: boolean,
  blockedBy: ReadonlySet<TodoID>,
};

const COLLECTION_SUBSCRIBERS = {};

type State = ReadonlyArray<TodoItem>;

type ACTION =
  | {
      type: 'ADD_TODO',
      payload: string,
    }
  | {
      type: 'COMPLETE_TODO',
      payload: TodoID,
    }
  | {
      type: 'REMOVE_TODO',
      payload: TodoID,
    }
  | {
      type: 'CHANGE_TODO_DESCRIPTION',
      payload: {
        todoID: TodoID,
        description: string,
      },
    }
  | {
      type: 'BLOCKED_BY',
      payload: {
        todoID: TodoID,
        blockedBy: TodoID,
      },
    };

// A fake flux-like store for testing purposes.
class TodoStore {
  _state: State;
  _subscriptions: Map<
    TodoID | typeof COLLECTION_SUBSCRIBERS,
    Array<() => void>,
  >;
  _logFn: (event: LogEvent) => void;

  constructor() {
    this._state = [];
    this._subscriptions = new Map();
    this._logFn = () => {};
  }

  getState(): State {
    return this._state;
  }

  dispatch(action: ACTION) {
    switch (action.type) {
      case 'ADD_TODO':
        this._state = [
          ...this._state,
          {
            blockedBy: new Set<TodoID>(),
            description: action.payload,
            isCompleted: false,
            todoID: `todo-${this._state.length + 1}`,
          },
        ];
        this._notify([COLLECTION_SUBSCRIBERS]);
        break;
      case 'COMPLETE_TODO': {
        this._state = this._state.map(todo => {
          if (todo.todoID === action.payload) {
            return {
              ...todo,
              isCompleted: true,
            };
          } else {
            return todo;
          }
        });
        this._notify([action.payload]);
        break;
      }
      case 'REMOVE_TODO': {
        this._state = this._state
          .filter(todo => {
            return todo.todoID != action.payload;
          })
          .map(todo => {
            const blockedBy = new Set(todo.blockedBy);
            blockedBy.delete(action.payload);
            return {
              ...todo,
              blockedBy,
            };
          });

        // We also need to notify all individual `todo` subscribers that they
        // item is gone now.
        this._notify([action.payload, COLLECTION_SUBSCRIBERS]);
        this._subscriptions.delete(action.payload);
        break;
      }
      case 'BLOCKED_BY': {
        this._state = this._state.map(todo => {
          if (todo.todoID === action.payload.todoID) {
            const blockedBy = new Set(todo.blockedBy);
            blockedBy.add(action.payload.blockedBy);
            return {
              ...todo,
              blockedBy,
            };
          } else {
            return todo;
          }
        });
        this._notify([action.payload.todoID]);
        break;
      }
      case 'CHANGE_TODO_DESCRIPTION': {
        this._state = this._state.map(todo => {
          if (todo.todoID === action.payload.todoID) {
            return {
              ...todo,
              description: action.payload.description,
            };
          } else {
            return todo;
          }
        });
        this._notify([action.payload.todoID]);
        break;
      }
      default:
        action.type as empty;
    }
  }

  subscribe(maybeTodoID: string | null, cb: () => void): () => void {
    const subscriber = maybeTodoID ?? COLLECTION_SUBSCRIBERS;
    let subscriptions = this._subscriptions.get(subscriber);
    if (subscriptions == null) {
      subscriptions = [];
      this._subscriptions.set(subscriber, subscriptions);
    }
    if (subscriptions != null) {
      subscriptions.push(cb);
    }

    return () => {
      if (subscriptions != null) {
        subscriptions = subscriptions.filter(x => x !== cb);
      }
    };
  }

  reset(logger: (event: LogEvent) => void) {
    this._state = [];
    this._subscriptions = new Map();
    this._logFn = logger;
  }

  _notify(subscribers: ReadonlyArray<TodoID | typeof COLLECTION_SUBSCRIBERS>) {
    subscribers.forEach(subscriber => {
      const subscriptions = this._subscriptions.get(subscriber);
      if (subscriptions != null) {
        subscriptions.forEach(cb => {
          cb();
        });
      }
    });
  }
}

const Selectors = {
  getTodo(state: State, maybeTodoID: string): ?TodoItem {
    return state.find(item => item.todoID === maybeTodoID);
  },
  getTodoIDs(state: State): ReadonlyArray<TodoID> {
    return state.map(item => item.todoID);
  },
};

const TODO_STORE: TodoStore = new TodoStore();

function resetStore(logFn: (event: LogEvent) => void) {
  TODO_STORE.reset(logFn);
}

function addTodo(description: string) {
  TODO_STORE.dispatch({
    payload: description,
    type: 'ADD_TODO',
  });
}

function completeTodo(todoID: string) {
  TODO_STORE.dispatch({
    payload: todoID as TodoID,
    type: 'COMPLETE_TODO',
  });
}

function removeTodo(todoID: string) {
  TODO_STORE.dispatch({
    payload: todoID,
    type: 'REMOVE_TODO',
  });
}

function blockedBy(todoID: string, blockedBy: string) {
  TODO_STORE.dispatch({
    payload: {
      blockedBy,
      todoID,
    },
    type: 'BLOCKED_BY',
  });
}

function changeDescription(todoID: string, description: string) {
  TODO_STORE.dispatch({
    payload: {
      description,
      todoID,
    },
    type: 'CHANGE_TODO_DESCRIPTION',
  });
}

module.exports = {
  Selectors,
  TODO_STORE,
  addTodo,
  blockedBy,
  changeDescription,
  completeTodo,
  removeTodo,
  resetStore,
};
