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

type State = number;

// A fake flux-like store for testing purposes.
class Store {
  _state: State;
  _subscriptions: Array<() => void>;
  constructor() {
    this._state = 0;
    this._subscriptions = [];
  }
  getState(): State {
    return this._state;
  }
  dispatch(action: {type: 'INCREMENT'}) {
    switch (action.type) {
      case 'INCREMENT':
        this._state += 1;
        break;
      default:
        action.type as empty;
    }
    this._subscriptions.forEach(cb => cb());
  }
  subscribe(cb: () => void): () => void {
    this._subscriptions.push(cb);
    return () => {
      this._subscriptions = this._subscriptions.filter(x => x !== cb);
    };
  }
  reset() {
    this._state = 0;
    this._subscriptions = [];
  }
  getSubscriptionsCount(): number {
    return this._subscriptions.length;
  }
}

const Selectors = {
  getNumber(state: State): number {
    return state;
  },
};

const GLOBAL_STORE: Store = new Store();

function resetStore() {
  GLOBAL_STORE.reset();
}

module.exports = {GLOBAL_STORE, Selectors, resetStore};
