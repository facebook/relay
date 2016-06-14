/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GraphQLStoreChangeEmitter
 * @flow
 */

'use strict';

const ErrorUtils = require('ErrorUtils');
import type GraphQLStoreRangeUtils from 'GraphQLStoreRangeUtils';
import type {ChangeSubscription} from 'RelayTypes';

const resolveImmediate = require('resolveImmediate');

type BatchStrategy = (callback: Function) => void;
type SubscriptionCallback = () => void;

type Subscriber = {
  callback: SubscriptionCallback,
  subscribedIDs: Array<string>,
};

/**
 * Asynchronous change emitter for nodes stored in the Relay cache.
 *
 * Changes are produced by `RelayStoreData` after writing query and mutation
 * payloads into the store and consumed by `GraphQLStoreQueryResolver`, which
 * subscribes to all records that are part of an active query result set.
 *
 * @internal
 */
class GraphQLStoreChangeEmitter {
  _batchUpdate: BatchStrategy;
  _executingIDs: Object;
  _rangeData: GraphQLStoreRangeUtils;
  _scheduledIDs: ?Object;
  _subscribers: Array<Subscriber>;

  constructor(rangeData: GraphQLStoreRangeUtils) {
    this._batchUpdate = callback => callback();
    this._executingIDs = {};
    this._rangeData = rangeData;
    this._scheduledIDs = null;
    this._subscribers = [];
  }

  addListenerForIDs(
    ids: Array<string>,
    callback: SubscriptionCallback
  ): ChangeSubscription {
    const subscribedIDs = ids.map(id => this._getBroadcastID(id));
    const index = this._subscribers.length;
    this._subscribers.push({subscribedIDs, callback});
    return {
      remove: () => {
        delete this._subscribers[index];
      },
    };
  }

  broadcastChangeForID(id: string): void {
    let scheduledIDs = this._scheduledIDs;
    if (scheduledIDs == null) {
      resolveImmediate(() => this._processBroadcasts());
      scheduledIDs = this._scheduledIDs = {};
    }
    // Record index of the last subscriber so we do not later unintentionally
    // invoke callbacks that were subscribed after this broadcast.
    scheduledIDs[this._getBroadcastID(id)] = this._subscribers.length - 1;
  }

  injectBatchingStrategy(batchStrategy: BatchStrategy): void {
    this._batchUpdate = batchStrategy;
  }

  _processBroadcasts(): void {
    if (this._scheduledIDs) {
      this._executingIDs = this._scheduledIDs;
      this._scheduledIDs = null;
      this._batchUpdate(() => this._processSubscribers());
    }
  }

  /**
   * Exposed for profiling reasons.
   * @private
   */
  _processSubscribers(): void {
    this._subscribers.forEach((subscriber, subscriberIndex) =>
      this._processSubscriber(subscriber, subscriberIndex)
    );
  }

  _processSubscriber(
    {subscribedIDs, callback}: Subscriber,
    subscriberIndex: number
  ): void {
    for (const broadcastID in this._executingIDs) {
      if (this._executingIDs.hasOwnProperty(broadcastID)) {
        const broadcastIndex = this._executingIDs[broadcastID];
        if (broadcastIndex < subscriberIndex) {
          // Callback was subscribed after this particular broadcast.
          break;
        }
        if (subscribedIDs.indexOf(broadcastID) >= 0) {
          ErrorUtils.applyWithGuard(
            callback,
            null,
            null,
            null,
            'GraphQLStoreChangeEmitter'
          );
          break;
        }
      }
    }
  }

  /**
   * Ranges publish events for the entire range, not the specific view of that
   * range. For example, if "client:1" is a range, the event is on "client:1",
   * not "client:1_first(5)".
   */
  _getBroadcastID(id: string): string {
    return this._rangeData.getCanonicalClientID(id);
  }
}

module.exports = GraphQLStoreChangeEmitter;
