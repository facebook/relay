/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayBufferedNeglectionStateMap
 * @flow
 * @typechecks
 */

'use strict';

import type {DataID} from 'RelayInternalTypes';
import type {NeglectionState} from 'RelayNeglectionStateMap';
import type RelayNeglectionStateMap from 'RelayNeglectionStateMap';

var invariant = require('invariant');

type BufferedChange = {
  type: 'decrease' | 'increase' | 'register' | 'remove';
  dataID: DataID;
};

/**
 * @internal
 *
 * A class that implements the `SortedMap` interface for a mapping from
 * DataID to NeglectionState.
 */
class RelayBufferedNeglectionStateMap {
  _bufferedChanges: Array<BufferedChange>;
  _neglectionStateMap: RelayNeglectionStateMap;

  constructor(
    neglectionStateMap: RelayNeglectionStateMap
  ) {
    this._bufferedChanges = [];
    this._neglectionStateMap = neglectionStateMap;
  }

  /**
   * Creates a buffered change that, once the buffer is flushed, decreases the
   * subscriptions-count for the given data ID.
   */
  decreaseSubscriptionsFor(dataID: DataID): void {
    this._bufferedChanges.push({
      type: 'decrease',
      dataID,
    });
  }

  /**
   * Creates a buffered change that, once the buffer is flushed, increases the
   * subscriptions-count for the given data ID.
   */
  increaseSubscriptionsFor(dataID: DataID): void {
    this._bufferedChanges.push({
      type: 'increase',
      dataID,
    });
  }

  /**
   * Creates a buffered change that, once the buffer is flushed, creates an
   * entry for the data ID in the underlying `RelayNeglectionStateMap`.
   */
  register(dataID: DataID): void {
    this._bufferedChanges.push({
      type: 'register',
      dataID,
    });
  }

  /**
   * Creates a buffered change that, once the buffer is flushed, removes the
   * data ID from the underlying `RelayNeglectionStateMap`.
   */
  remove(dataID: DataID): void {
    this._bufferedChanges.push({
      type: 'remove',
      dataID,
    });
  }

  /**
   * Returns the number of registered data IDs in the underlying
   * `RelayStoreNeglectionStates`.
   */
  size(): number {
    return this._neglectionStateMap.size();
  }

  /**
   * Returns the iterator returned by `values` on the underlying
   * `RelayNeglectionStateMap`.
   */
  values(): Iterator<NeglectionState> {
    return this._neglectionStateMap.values();
  }

  flushBuffer(): void {
    this._bufferedChanges.forEach(action => {
      var {type, dataID} = action;
      switch (type) {
        case 'decrease':
          this._neglectionStateMap.decreaseSubscriptionsFor(dataID);
          break;
        case 'increase':
          this._neglectionStateMap.increaseSubscriptionsFor(dataID);
          break;
        case 'register':
          this._neglectionStateMap.register(dataID);
          break;
        case 'remove':
          this._neglectionStateMap.remove(dataID);
          break;
        default:
          invariant(
            false,
            'RelayBufferedNeglectionStateMap._flushBufferedChanges: ' +
            'Invalid type %s for buffered chaged',
            type
          );
      }
    });
    this._bufferedChanges = [];
  }
}

module.exports = RelayBufferedNeglectionStateMap;
