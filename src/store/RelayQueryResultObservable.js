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

import type GraphQLFragmentPointer from 'GraphQLFragmentPointer';
var RelayFragmentResolver = require('RelayFragmentResolver');
import type RelayStoreData from 'RelayStoreData';
import type {
  StoreReaderData,
  Subscription,
  SubscriptionCallbacks,
} from 'RelayTypes';

var invariant = require('invariant');

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
  _fragmentResolver: RelayFragmentResolver;

  constructor(
    storeData: RelayStoreData,
    fragmentPointer: GraphQLFragmentPointer
  ) {
    this._fragmentResolver = new RelayFragmentResolver(
      storeData,
      fragmentPointer
    );
  }

  subscribe(callbacks: SubscriptionCallbacks<?StoreReaderData>): Subscription {
    var subscription = this._fragmentResolver.subscribe(callbacks);
    callbacks.onNext && callbacks.onNext(this._fragmentResolver.read());
    return subscription;
  }
}

module.exports = RelayQueryResultObservable;
