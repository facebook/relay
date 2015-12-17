/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQueryResultObservable
 * @typechecks
 * @flow
 */

'use strict';

const GraphQLFragmentPointer = require('GraphQLFragmentPointer');
const GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');
import type RelayStoreData from 'RelayStoreData';
import type {
  StoreReaderData,
  Subscription,
  SubscriptionCallbacks,
} from 'RelayTypes';

const invariant = require('invariant');

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
class RelayQueryResultObservable {
  _data: ?StoreReaderData;
  _fragmentPointer: GraphQLFragmentPointer;
  _queryResolver: ?GraphQLStoreQueryResolver;
  _storeData: RelayStoreData;
  _subscriptionCallbacks: Array<SubscriptionCallbacks<?StoreReaderData>>;
  _subscriptionCount: number;

  constructor(
    storeData: RelayStoreData,
    fragmentPointer: GraphQLFragmentPointer
  ) {
    this._data = undefined;
    this._fragmentPointer = fragmentPointer;
    this._queryResolver = null;
    this._storeData = storeData;
    this._subscriptionCallbacks = [];
    this._subscriptionCount = 0;
  }

  subscribe(callbacks: SubscriptionCallbacks<?StoreReaderData>): Subscription {
    this._subscriptionCount++;
    var subscriptionIndex = this._subscriptionCallbacks.length;
    var subscription = {
      dispose: () => {
        invariant(
          this._subscriptionCallbacks[subscriptionIndex],
          'RelayQueryResultObservable: Subscriptions may only be disposed once.'
        );
        delete this._subscriptionCallbacks[subscriptionIndex];
        this._subscriptionCount--;
        if (this._subscriptionCount === 0) {
          this._unobserve();
        }
      },
    };
    this._subscriptionCallbacks.push(callbacks);

    if (this._subscriptionCount === 1) {
      this._resolveData(this._observe());
    }
    this._fire(callbacks);

    return subscription;
  }

  _observe(): GraphQLStoreQueryResolver {
    invariant(
      !this._queryResolver,
      'RelayQueryResultObservable: Initialized twice.'
    );
    var queryResolver = new GraphQLStoreQueryResolver(
      this._storeData,
      this._fragmentPointer,
      () => this._onUpdate(queryResolver)
    );
    this._queryResolver = queryResolver;
    return queryResolver;
  }

  _unobserve(): void {
    if (this._queryResolver) {
      this._data = undefined;
      this._queryResolver.reset();
      this._queryResolver = null;
    }
  }

  _onUpdate(queryResolver: GraphQLStoreQueryResolver): void {
    this._resolveData(queryResolver);
    this._subscriptionCallbacks.forEach(callbacks => this._fire(callbacks));
  }

  _fire(callbacks: SubscriptionCallbacks<?StoreReaderData>): void {
    callbacks.onNext && callbacks.onNext(this._data);
  }

  _resolveData(queryResolver: GraphQLStoreQueryResolver): void {
    var data = queryResolver.resolve(this._fragmentPointer);
    invariant(
      !Array.isArray(data),
      'RelayQueryResultObservable: Plural fragments are not supported.'
    );
    this._data = data;
  }
}

module.exports = RelayQueryResultObservable;
