/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GraphQLStoreChangeEmitter
 * @typechecks
 * 
 */

'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
var ErrorUtils = require('fbjs/lib/ErrorUtils');

var resolveImmediate = require('fbjs/lib/resolveImmediate');

/**
 * Asynchronous change emitter for nodes stored in the Relay cache.
 *
 * Changes are produced by `RelayStoreData` after writing query and mutation
 * payloads into the store and consumed by `GraphQLStoreQueryResolver`, which
 * subscribes to all records that are part of an active query result set.
 *
 * @internal
 */

var GraphQLStoreChangeEmitter = (function () {
  function GraphQLStoreChangeEmitter(rangeData) {
    _classCallCheck(this, GraphQLStoreChangeEmitter);

    this._batchUpdate = function (callback) {
      return callback();
    };
    this._executingIDs = {};
    this._rangeData = rangeData;
    this._scheduledIDs = null;
    this._subscribers = [];
  }

  GraphQLStoreChangeEmitter.prototype.hasActiveListeners = function hasActiveListeners() {
    return this._subscribers.some(function (subscriber) {
      return !!subscriber;
    });
  };

  GraphQLStoreChangeEmitter.prototype.addListenerForIDs = function addListenerForIDs(ids, callback) {
    var _this = this;

    var subscribedIDs = ids.map(function (id) {
      return _this._getBroadcastID(id);
    });
    var index = this._subscribers.length;
    this._subscribers.push({ subscribedIDs: subscribedIDs, callback: callback });
    return {
      remove: function remove() {
        delete _this._subscribers[index];
      }
    };
  };

  GraphQLStoreChangeEmitter.prototype.broadcastChangeForID = function broadcastChangeForID(id) {
    var _this2 = this;

    var scheduledIDs = this._scheduledIDs;
    if (scheduledIDs == null) {
      resolveImmediate(function () {
        return _this2._processBroadcasts();
      });
      scheduledIDs = this._scheduledIDs = {};
    }
    // Record index of the last subscriber so we do not later unintentionally
    // invoke callbacks that were subscribed after this broadcast.
    scheduledIDs[this._getBroadcastID(id)] = this._subscribers.length - 1;
  };

  GraphQLStoreChangeEmitter.prototype.injectBatchingStrategy = function injectBatchingStrategy(batchStrategy) {
    this._batchUpdate = batchStrategy;
  };

  GraphQLStoreChangeEmitter.prototype._processBroadcasts = function _processBroadcasts() {
    var _this3 = this;

    if (this._scheduledIDs) {
      this._executingIDs = this._scheduledIDs;
      this._scheduledIDs = null;
      this._batchUpdate(function () {
        return _this3._processSubscribers();
      });
    }
  };

  /**
   * Exposed for profiling reasons.
   * @private
   */

  GraphQLStoreChangeEmitter.prototype._processSubscribers = function _processSubscribers() {
    var _this4 = this;

    this._subscribers.forEach(function (subscriber, subscriberIndex) {
      return _this4._processSubscriber(subscriber, subscriberIndex);
    });
  };

  GraphQLStoreChangeEmitter.prototype._processSubscriber = function _processSubscriber(_ref, subscriberIndex) {
    var subscribedIDs = _ref.subscribedIDs;
    var callback = _ref.callback;

    for (var broadcastID in this._executingIDs) {
      if (this._executingIDs.hasOwnProperty(broadcastID)) {
        var broadcastIndex = this._executingIDs[broadcastID];
        if (broadcastIndex < subscriberIndex) {
          // Callback was subscribed after this particular broadcast.
          break;
        }
        if (subscribedIDs.indexOf(broadcastID) >= 0) {
          ErrorUtils.applyWithGuard(callback, null, null, null, 'GraphQLStoreChangeEmitter');
          break;
        }
      }
    }
  };

  /**
   * Ranges publish events for the entire range, not the specific view of that
   * range. For example, if "client:1" is a range, the event is on "client:1",
   * not "client:1_first(5)".
   */

  GraphQLStoreChangeEmitter.prototype._getBroadcastID = function _getBroadcastID(id) {
    return this._rangeData.getCanonicalClientID(id);
  };

  return GraphQLStoreChangeEmitter;
})();

module.exports = GraphQLStoreChangeEmitter;