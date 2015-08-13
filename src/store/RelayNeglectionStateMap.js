/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayNeglectionStateMap
 * @flow
 * @typechecks
 */

'use strict';

var Map = require('Map');
import type {DataID} from 'RelayInternalTypes';

var invariant = require('invariant');

export type NeglectionState = {
  collectible: boolean;
  dataID: DataID;
  generations: number;
  subscriptions: number;
};

/**
 * @internal
 *
 * A class that implements the `SortedMap` interface for a mapping from
 * DataID to NeglectionState.
 */
class RelayNeglectionStateMap {
  _isSorted: boolean;
  _map: Map<DataID, ?NeglectionState>;
  _states: Array<NeglectionState>;

  constructor() {
    this._isSorted = true;
    this._map = new Map();
    this._states = [];
  }

  decreaseSubscriptionsFor(dataID: DataID): void {
    this._isSorted = false;
    invariant(
      this._map.has(dataID),
      'RelayNeglectionStatesMap.decreaseSubscriptionsFor(): Cannot ' +
      'decrease subscriptions for unregistered record `%s`.',
      dataID
    );

    var data = this._map.get(dataID);
    invariant(
      data.subscriptions > 0,
      'RelayNeglectionStatesMap.decreaseSubscriptionsFor(): Cannot ' +
      'decrease subscriptions below 0 for record `%s`.',
      dataID
    );
    data.subscriptions--;
    this._map.set(dataID, data);
  }

  increaseSubscriptionsFor(dataID: DataID): void {
    this._isSorted = false;
    if (!this._map.has(dataID)) {
      this._registerWithSubscriptionCount(dataID, 1);
      return;
    }
    var data = this._map.get(dataID);
    data.subscriptions++;
    this._map.set(dataID, data);
  }

  register(dataID: DataID): void {
    this._isSorted = false;
    if (!this._map.has(dataID)) {
      this._registerWithSubscriptionCount(dataID, 0);
    }
  }

  remove(dataID: DataID): void {
    this._map.delete(dataID);
  }

  size(): number {
    return this._map.size;
  }

  values(): Iterator<NeglectionState> {
    this._sort();
    var done = false;
    var ii = 0;
    var states = this._states.slice();
    /* $FlowFixMe(>=0.14.0) - So all iterators are supposed to also be
     * iterable. That means myIterator[Symbol.iterator]() should probably return
     * myIterator. However Flow and many browsers don't have support for Symbol
     * yet.
     *
     * So yeah...this should probably be re-written to use a generator instead,
     * assuming a generator transform is available.
     */
    return {
      next(): IteratorResult<NeglectionState> {
        if (done || ii === states.length) {
          done = true;
          states = [];
          return ({done}: $FlowIssue);
        }
        var value = states[ii++];
        return {done, value};
      },
    };
  }

  /**
   * Registers the given dataID and sets the initial number of subscriptions
   * for it.
   */
  _registerWithSubscriptionCount(dataID: DataID, subscriptions: number): void {
    this._isSorted = false;
    this._map.set(dataID, {
      dataID,
      collectible: false,
      generations: 0,
      subscriptions,
    });
  }

  _sort(): void {
    if (!this._isSorted) {
      this._states = [];
      this._map.forEach(state => state && this._states.push(state));
      this._states.sort((a, b) => a.subscriptions - b.subscriptions);
      this._isSorted = true;
    }
  }
}

module.exports = RelayNeglectionStateMap;
