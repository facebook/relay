/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQueryResultObservable
 * @flow
 */

'use strict';

const GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');

const invariant = require('invariant');

import type {DataID} from 'RelayInternalTypes';
import type RelayQuery from 'RelayQuery';
import type RelayStoreData from 'RelayStoreData';
import type {
  StoreReaderData,
  Subscription,
  SubscriptionCallbacks,
} from 'RelayTypes';

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
  _dataID: DataID;
  _fragment: RelayQuery.Fragment;
  _fragmentResolver: ?GraphQLStoreQueryResolver;
  _storeData: RelayStoreData;
  _subscriptionCallbacks: Array<SubscriptionCallbacks<?StoreReaderData>>;
  _subscriptionCount: number;

  constructor(
    storeData: RelayStoreData,
    fragment: RelayQuery.Fragment,
    dataID: DataID
  ) {
    this._data = undefined;
    this._dataID = dataID;
    this._fragment = fragment;
    this._fragmentResolver = null;
    this._storeData = storeData;
    this._subscriptionCallbacks = [];
    this._subscriptionCount = 0;
  }

  subscribe(callbacks: SubscriptionCallbacks<?StoreReaderData>): Subscription {
    this._subscriptionCount++;
    const subscriptionIndex = this._subscriptionCallbacks.length;
    const subscription = {
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
      !this._fragmentResolver,
      'RelayQueryResultObservable: Initialized twice.'
    );
    const fragmentResolver = new GraphQLStoreQueryResolver(
      this._storeData,
      this._fragment,
      () => this._onUpdate(fragmentResolver)
    );
    this._fragmentResolver = fragmentResolver;
    return fragmentResolver;
  }

  _unobserve(): void {
    if (this._fragmentResolver) {
      this._data = undefined;
      this._fragmentResolver.dispose();
      this._fragmentResolver = null;
    }
  }

  _onUpdate(fragmentResolver: GraphQLStoreQueryResolver): void {
    this._resolveData(fragmentResolver);
    this._subscriptionCallbacks.forEach(callbacks => this._fire(callbacks));
  }

  _fire(callbacks: SubscriptionCallbacks<?StoreReaderData>): void {
    callbacks.onNext && callbacks.onNext(this._data);
  }

  _resolveData(fragmentResolver: GraphQLStoreQueryResolver): void {
    const data = fragmentResolver.resolve(this._fragment, this._dataID);
    invariant(
      !Array.isArray(data),
      'RelayQueryResultObservable: Plural fragments are not supported.'
    );
    this._data = data;
  }
}

module.exports = RelayQueryResultObservable;
