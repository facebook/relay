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

import type {ChangeSubscription} from 'GraphQLStoreChangeEmitter';
import type {DataID} from 'RelayInternalTypes';
import type RelayQuery from 'RelayQuery';
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
const resolveImmediate = require('resolveImmediate');

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
  _dataID: DataID;
  _fragment: RelayQuery.Fragment;
  _storeData: RelayStoreData;
  _subscriptions: Array<SubscriptionCallbacks>;
  _subscribedIDs: DataIDSet;

  constructor(
    storeData: RelayStoreData,
    fragment: RelayQuery.Fragment,
    dataID: DataID,
    prevData?: ?StoreReaderData
  ) {
    this._changeSubscription = null;
    this._data = prevData;
    this._dataID = dataID;
    this._fragment = fragment;
    this._storeData = storeData;
    this._subscriptions = [];
    this._subscribedIDs = {};
  }

  subscribe(callbacks: SubscriptionCallbacks): Subscription {
    const subscription = {
      dispose: () => {
        this._subscriptions = this._subscriptions.filter(c => c !== callbacks);
        resolveImmediate(() =>{
          if (!this._subscriptions.length) {
            this._unobserve();
          }
        });
      },
    };
    this._subscriptions.push(callbacks);
    if (!this._changeSubscription) {
      this._observe();
    } else {
      callbacks.onNext(this._data);
    }
    return subscription;
  }

  _observe(): void {
    const prevChangeSubscription = this._changeSubscription;
    const prevData = this._data;
    const prevIDs = this._subscribedIDs;
    let nextChangeSubscription;

    const {data, dataIDs} = readRelayQueryData(
      this._storeData,
      this._fragment,
      this._dataID
    );
    const nextData = recycleNodesInto(
      prevData,
      data
    );

    if (nextData !== prevData || !prevChangeSubscription) {
      dataIDs[this._dataID] = true;
      prevChangeSubscription && prevChangeSubscription.remove();
      this._updateGarbageCollectorSubscriptionCount(prevIDs, dataIDs);
      const changeEmitter = this._storeData.getChangeEmitter();
      nextChangeSubscription = changeEmitter.addListenerForIDs(
        Object.keys(dataIDs),
        () => this._observe()
      );
    }
    this._changeSubscription = nextChangeSubscription;
    this._data = data;
    this._subscribedIDs = dataIDs;

    this._subscriptions.forEach(callbacks => callbacks.onNext(data));
  }

  _unobserve(): void {
    if (this._changeSubscription) {
      this._changeSubscription.remove();
      this._updateGarbageCollectorSubscriptionCount(this._subscribedIDs, {});

      this._changeSubscription = null;
      this._data = undefined;
      this._subscribedIDs = {};
    }
  }

  _updateGarbageCollectorSubscriptionCount(
    prevIDs: DataIDSet,
    nextIDs: DataIDSet
  ): void {
    const gc = this._storeData.getGarbageCollector();
    if (gc) {
      Object.keys(prevIDs).forEach(id => gc.decrementReferenceCount(id));
      Object.keys(nextIDs).forEach(id => gc.incrementReferenceCount(id));
    }
  }
}

module.exports = RelayFragmentResolver;
