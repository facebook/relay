/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQueryResultObservable
 * @typechecks
 * 
 */

'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var GraphQLStoreQueryResolver = require('./GraphQLStoreQueryResolver');

var invariant = require('fbjs/lib/invariant');

/**
 * An Rx Observable representing the results of a fragment in the local cache.
 * Subscribers are notified as follows:
 *
 * `onNext`: Called with the latest results of a fragment. Results may be `null`
 * if the data was marked as deleted or `undefined` if the fragment was either
 * not fetched or evicted from the cache. Note that required fields may be
 * missing if the fragment was not fetched with `Relay.Store.primeCache` or
 * `Relay.Store.forceFetch` before creating a subscription.
 * - Called synchronously on `subscribe()`.
 * - Called whenever the results of the fragment change.
 *
 * `onError`: Currently not called. In the future this may be used to indicate
 * that required data for the fragment has not been fetched or was evicted
 * from the cache.
 *
 * `onCompleted`: Not called.
 *
 * @see http://reactivex.io/documentation/observable.html
 */

var RelayQueryResultObservable = (function () {
  function RelayQueryResultObservable(storeData, fragment, dataID) {
    _classCallCheck(this, RelayQueryResultObservable);

    this._data = undefined;
    this._dataID = dataID;
    this._fragment = fragment;
    this._fragmentResolver = null;
    this._storeData = storeData;
    this._subscriptionCallbacks = [];
    this._subscriptionCount = 0;
  }

  RelayQueryResultObservable.prototype.subscribe = function subscribe(callbacks) {
    var _this = this;

    this._subscriptionCount++;
    var subscriptionIndex = this._subscriptionCallbacks.length;
    var subscription = {
      dispose: function dispose() {
        !_this._subscriptionCallbacks[subscriptionIndex] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayQueryResultObservable: Subscriptions may only be disposed once.') : invariant(false) : undefined;
        delete _this._subscriptionCallbacks[subscriptionIndex];
        _this._subscriptionCount--;
        if (_this._subscriptionCount === 0) {
          _this._unobserve();
        }
      }
    };
    this._subscriptionCallbacks.push(callbacks);

    if (this._subscriptionCount === 1) {
      this._resolveData(this._observe());
    }
    this._fire(callbacks);

    return subscription;
  };

  RelayQueryResultObservable.prototype._observe = function _observe() {
    var _this2 = this;

    !!this._fragmentResolver ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayQueryResultObservable: Initialized twice.') : invariant(false) : undefined;
    var fragmentResolver = new GraphQLStoreQueryResolver(this._storeData, this._fragment, function () {
      return _this2._onUpdate(fragmentResolver);
    });
    this._fragmentResolver = fragmentResolver;
    return fragmentResolver;
  };

  RelayQueryResultObservable.prototype._unobserve = function _unobserve() {
    if (this._fragmentResolver) {
      this._data = undefined;
      this._fragmentResolver.dispose();
      this._fragmentResolver = null;
    }
  };

  RelayQueryResultObservable.prototype._onUpdate = function _onUpdate(fragmentResolver) {
    var _this3 = this;

    this._resolveData(fragmentResolver);
    this._subscriptionCallbacks.forEach(function (callbacks) {
      return _this3._fire(callbacks);
    });
  };

  RelayQueryResultObservable.prototype._fire = function _fire(callbacks) {
    callbacks.onNext && callbacks.onNext(this._data);
  };

  RelayQueryResultObservable.prototype._resolveData = function _resolveData(fragmentResolver) {
    var data = fragmentResolver.resolve(this._fragment, this._dataID);
    !!Array.isArray(data) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayQueryResultObservable: Plural fragments are not supported.') : invariant(false) : undefined;
    this._data = data;
  };

  return RelayQueryResultObservable;
})();

module.exports = RelayQueryResultObservable;