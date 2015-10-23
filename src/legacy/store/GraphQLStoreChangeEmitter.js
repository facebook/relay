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

export type ChangeSubscription = {
  remove: () => void;
};

var batchUpdate = callback => callback();
var subscribers = [];

var executingIDs = {};
var scheduledIDs = null;

/**
 * Asynchronous change emitter for nodes stored in the Relay cache.
 *
 * Changes are produced by `RelayStoreData` after writing query and mutation
 * payloads into the store and consumed by `GraphQLStoreQueryResolver`, which
 * subscribes to all records that are part of an active query result set.
 *
 * @internal
 */
var GraphQLStoreChangeEmitter = {

  addListenerForIDs: function(
    ids: Array<string>,
    callback: () => void
  ): ChangeSubscription {
    var subscribedIDs = ids.map(getBroadcastID);
    var index = subscribers.length;
    subscribers.push({subscribedIDs, callback});
    return {
      remove: function() {
        delete subscribers[index];
      }
    };
  },

  broadcastChangeForID: function(id: string): void {
    if (scheduledIDs === null) {
      resolveImmediate(processBroadcasts);
      scheduledIDs = {};
    }
    // Record index of the last subscriber so we do not later unintentionally
    // invoke callbacks that were subscribed after this broadcast.
    scheduledIDs[getBroadcastID(id)] = subscribers.length - 1;
  },

  injectBatchingStrategy: function(batchStrategy: Function): void {
    batchUpdate = batchStrategy;
  },

  /**
   * Exposed for profiling reasons.
   * @private
   */
  _processSubscribers: processSubscribers

};

function processBroadcasts(): void {
  if (scheduledIDs) {
    executingIDs = scheduledIDs;
    scheduledIDs = null;
    batchUpdate(processSubscribers);
  }
}

function processSubscribers(): void {
  subscribers.forEach(processSubscriber);
}

function processSubscriber({subscribedIDs, callback}, subscriberIndex): void {
  for (var broadcastID in executingIDs) {
    if (executingIDs.hasOwnProperty(broadcastID)) {
      var broadcastIndex = executingIDs[broadcastID];
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
function getBroadcastID(id: string): string {
  return GraphQLStoreRangeUtils.getCanonicalClientID(id);
}

module.exports = GraphQLStoreChangeEmitter;
