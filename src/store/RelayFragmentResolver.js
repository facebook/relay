/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayFragmentResolver
 * @typechecks
 * @flow
 */

'use strict';

import type GraphQLFragmentPointer from 'GraphQLFragmentPointer';
import type {ChangeSubscription} from 'GraphQLStoreChangeEmitter';
import type {DataID} from 'RelayInternalTypes';
import type RelayQueryTracker from 'RelayQueryTracker';
import type RelayStoreData from 'RelayStoreData';
import type {
  StoreReaderData,
  Subscription,
  SubscriptionCallbacks,
} from 'RelayTypes';

const filterExclusiveKeys = require('filterExclusiveKeys');
const invariant = require('invariant');
const readRelayQueryData = require('readRelayQueryData');
const recycleNodesInto = require('recycleNodesInto');

type DataIDSet = {[dataID: DataID]: any};

/**
 * An Rx Observable representing the results of a fragment in the local cache.
 * Subscribers are notified as follows:
 *
 * `onNext`: Called when the result of the fragment change. Results may be
 * `null` if the data was marked as deleted or `undefined` if the fragment was
 * either not fetched or evicted from the cache. Note that required fields may
 * be missing if the fragment was not fetched with `Relay.Store.primeCache` or
 * `Relay.Store.forceFetch` before creating a subscription.
 *
 * `onError`: Currently not called. In the future this may be used to indicate
 * that required data for the fragment has not been fetched or was evicted
 * from the cache.
 *
 * `onCompleted`: Not called.
 *
 * @see http://reactivex.io/documentation/observable.html
 */
class RelayFragmentResolver {
  _changeSubscription: ?ChangeSubscription;
  _data: ?StoreReaderData;
  _dataIDs: DataIDSet;
  _fragmentPointer: GraphQLFragmentPointer;
  _queryTracker: ?RelayQueryTracker;
  _storeData: RelayStoreData;
  _subscriptionCallbacks: Array<SubscriptionCallbacks<?StoreReaderData>>;
  _subscriptionCount: number;

  constructor(
    storeData: RelayStoreData,
    fragmentPointer: GraphQLFragmentPointer
  ) {
    this._changeSubscription = null;
    this._data = undefined;
    this._dataIDs = {};
    this._fragmentPointer = fragmentPointer;
    this._queryTracker = null;
    this._storeData = storeData;
    this._subscriptionCallbacks = [];
    this._subscriptionCount = 0;
  }

  read(): ?RelayStoreData {
    if (!this._changeSubscription) {
      this._observe();
    }
    return this._data;
  }

  reset(): void {
    invariant(
      this._subscriptionCount === 0,
      'RelayFragmentResolver: Cannot reset a resolver with active subscriptions'
    );
    if (this._changeSubscription) {
      this._changeSubscription.remove();
      this._updateGarbageCollectorSubscriptionCount(this._dataIDs, {});

      this._changeSubscription = null;
      this._data = undefined;
      this._dataIDs = {};
      this._queryTracker = null;
    }
  }

  subscribe(callbacks: SubscriptionCallbacks<?StoreReaderData>): Subscription {
    this._subscriptionCount++;
    const subscriptionIndex = this._subscriptionCallbacks.length;
    const subscription = {
      dispose: () => {
        invariant(
          this._subscriptionCallbacks[subscriptionIndex],
          'RelayFragmentResolver: Subscriptions may only be disposed once.'
        );
        delete this._subscriptionCallbacks[subscriptionIndex];
        this._subscriptionCount--;
        setImmediate(() => {
          if (this._subscriptionCount === 0) {
            this.reset();
          }
        });
      },
    };
    this._subscriptionCallbacks.push(callbacks);

    if (!this._changeSubscription) {
      this._observe();
    }

    return subscription;
  }

  _fire(callbacks: SubscriptionCallbacks<?StoreReaderData>): void {
    callbacks.onNext && callbacks.onNext(this._data);
  }

  _observe(): void {
    const dataID = this._fragmentPointer.getDataID();
    const prevChangeSubscription = this._changeSubscription;
    const prevData = this._data;
    const prevIDs = this._dataIDs;
    let nextChangeSubscription;
    let {
      data: nextData,
      dataIDs: nextIDs,
      queryTracker: nextTracker,
    } = readRelayQueryData(
      this._storeData.getQueuedStore(),
      this._fragmentPointer.getFragment(),
      dataID
    );
    nextData = recycleNodesInto(prevData, nextData);

    if (nextData !== prevData || !prevChangeSubscription) {
      nextIDs[dataID] = true;
      this._updateGarbageCollectorSubscriptionCount(prevIDs, nextIDs);
      prevChangeSubscription && prevChangeSubscription.remove();
      const changeEmitter = this._storeData.getChangeEmitter();
      nextChangeSubscription = changeEmitter.addListenerForIDs(
        Object.keys(nextIDs),
        () => this._onUpdate()
      );
    }

    this._changeSubscription = nextChangeSubscription;
    this._data = nextData;
    this._dataIDs = nextIDs;
    this._queryTracker = nextTracker;
  }

  _onUpdate(): void {
    this._observe();
    this._subscriptionCallbacks.forEach(callbacks => this._fire(callbacks));
  }

  _updateGarbageCollectorSubscriptionCount(
    prevIDs: DataIDSet,
    nextIDs: DataIDSet
  ): void {
    const garbageCollector =
      this._storeData && this._storeData.getGarbageCollector();
    if (garbageCollector) {
      var [removed, added] = filterExclusiveKeys(prevIDs, nextIDs);

      added.forEach(id => garbageCollector.increaseSubscriptionsFor(id));
      removed.forEach(id => garbageCollector.decreaseSubscriptionsFor(id));
    }
  }
}

module.exports = RelayFragmentResolver;
