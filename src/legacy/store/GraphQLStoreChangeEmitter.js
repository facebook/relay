/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GraphQLStoreChangeEmitter
 * @typechecks
 * @flow
 */

'use strict';

var ErrorUtils = require('ErrorUtils');
var GraphQLStoreRangeUtils = require('GraphQLStoreRangeUtils');

var resolveImmediate = require('resolveImmediate');

type BatchStrategy = (callback: Function) => void;
type SubscriptionCallback = () => void;

export type ChangeSubscription = {
  remove: SubscriptionCallback;
};

type Subscriber = {
  callback: SubscriptionCallback,
  subscribedIDs: Array<string>,
};

/**
 * Asynchronous change emitter for nodes stored in the Relay cache.
 *
 * Changes are produced by `RelayStoreData` after writing query and mutation
 * payloads into the store and consumed by `RelayFragmentResolver`, which
 * subscribes to all records that are part of an active query result set.
 *
 * @internal
 */
class GraphQLStoreChangeEmitter {
  _batchUpdate: BatchStrategy;
  _subscribers: Array<Subscriber>;

  _executingIDs: Object;
  _scheduledIDs: ?Object;

  constructor() {
    this._batchUpdate = callback => callback();
    this._subscribers = [];

    this._executingIDs = {};
    this._scheduledIDs = null;
  }

  addListenerForIDs(
    ids: Array<string>,
    callback: SubscriptionCallback
  ): ChangeSubscription {
    var subscribedIDs = ids.map(getBroadcastID);
    var index = this._subscribers.length;
    this._subscribers.push({subscribedIDs, callback});
    return {
      remove: () => {
        delete this._subscribers[index];
      },
    };
  }

  broadcastChangeForID(id: string): void {
    var scheduledIDs = this._scheduledIDs;
    if (scheduledIDs == null) {
      resolveImmediate(() => this._processBroadcasts());
      scheduledIDs = this._scheduledIDs = {};
    }
    // Record index of the last subscriber so we do not later unintentionally
    // invoke callbacks that were subscribed after this broadcast.
    scheduledIDs[getBroadcastID(id)] = this._subscribers.length - 1;
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
    for (var broadcastID in this._executingIDs) {
      if (this._executingIDs.hasOwnProperty(broadcastID)) {
        var broadcastIndex = this._executingIDs[broadcastID];
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
}

/**
 * Ranges publish events for the entire range, not the specific view of that
 * range. For example, if "client:1" is a range, the event is on "client:1",
 * not "client:1_first(5)".
 */
function getBroadcastID(id: string): string {
  return GraphQLStoreRangeUtils.getCanonicalClientID(id);
}

module.exports = GraphQLStoreChangeEmitter;
