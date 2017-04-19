/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule observeRelayQueryData
 * @typechecks
 * @flow
 */

'use strict';
var GraphQLStoreChangeEmitter = require('GraphQLStoreChangeEmitter');
var RelayError = require('RelayError');
import type {DataID} from 'RelayInternalTypes';
import type RelayQuery from 'RelayQuery';
import type RelayRecordStore from 'RelayRecordStore';
var RelayStoreData = require('RelayStoreData');
import type RelayStoreGarbageCollector from 'RelayStoreGarbageCollector';
import type {
  Observable,
  StoreReaderData,
  StoreReaderOptions,
  Subscription,
  SubscriptionCallbacks
} from 'RelayTypes';

var emptyFunction = require('emptyFunction');
var filterExclusiveKeys = require('filterExclusiveKeys');
var invariant = require('invariant');
var readRelayQueryData = require('readRelayQueryData');
import type {StoreReaderResult} from 'readRelayQueryData';

type ChangeSubscription = {
  remove: () => void;
};
type BoundReadQueryData = () => StoreReaderResult;

/**
 * @internal
 */
function observeRelayQueryData(
  store: RelayRecordStore,
  queryNode: RelayQuery.Node,
  dataID: DataID,
  options?: StoreReaderOptions
): Observable<?StoreReaderData> {
  return new RelayQueryDataObservable(
    readRelayQueryData.bind(null, store, queryNode, dataID, options),
    dataID
  );
}

class RelayQueryDataObservable {
  _activeSubscriptions: number;
  _changeListener: ?ChangeSubscription;
  _data: ?StoreReaderData;
  _dataID: DataID;
  _lastError: ?Error;
  _observedDataIDs: {[dataID: DataID]: any};
  _readQueryData: BoundReadQueryData;
  _garbageCollector: ?RelayStoreGarbageCollector;
  _subscriptions: Array<?SubscriptionCallbacks<?StoreReaderData>>;

  _handleChange: () => void;
  _handleData: (subscriber: ?SubscriptionCallbacks) => void;
  _handleError: (subscriber: ?SubscriptionCallbacks) => void;

  constructor(
    readQueryData: BoundReadQueryData,
    dataID: DataID
  ) {
    this._activeSubscriptions = 0;
    this._changeListener = null;
    this._data = null;
    this._dataID = dataID;
    this._lastError = null;
    this._observedDataIDs = {};
    this._readQueryData = readQueryData;
    this._subscriptions = [];

    this._handleChange = this._handleChange.bind(this);
    this._handleData = this._handleData.bind(this);
    this._handleError = this._handleError.bind(this);

    this._garbageCollector =
      RelayStoreData.getDefaultInstance().getGarbageCollector();
  }

  subscribe(callbacks: SubscriptionCallbacks<?StoreReaderData>): Subscription {
    // We only ever start watching for data once the first subscriber is
    // registered
    if (!this._subscriptions.length) {
      this._watchQueryData();
    }

    // An error occurred earlier, we immediately inform the new subscriber
    // and return a function that does nothing
    if (this._lastError) {
      callbacks.onError(this._lastError);
      return {
        dispose: emptyFunction,
      };
    }

    var index = this._subscriptions.length;
    var isDisposed = false;
    this._subscriptions.push(callbacks);
    callbacks.onNext(this._data);
    this._activeSubscriptions++;

    return {
      dispose: () => {
        invariant(
          !isDisposed,
          'RelayObserver.dispose(): Subscription was already disposed.'
        );

        this._subscriptions[index] = null;
        this._activeSubscriptions--;
        isDisposed = true;
        // If this is the last subscription we stop watching for new data and
        // forget the data we have.
        if (!this._activeSubscriptions) {
          this._unregisterChangeListener();
          this._data = null;
          this._subscriptions = [];
          // Decrease count for all dataIDs observed by this observable
          this._updateGarbageCollectorSubscriptionCount({});
          // No longer observing any dataIDs
          this._observedDataIDs = {};
        }
      },
    };
  }

  /**
   * Invoked when the registered change listener is notified, if first reads new
   * data from the store and registered eventual new change listeners than
   * notifies any subscribers.
   * @callback
   */
  _handleChange() {
    // Run _watchQueryData to react to any subtree changes, this will
    // also update the value of `this._data`
    this._watchQueryData();
    this._subscriptions.forEach(
      this._lastError ? this._handleError : this._handleData
    );
  }

  /**
   * Calls `onNext` on all subscribers with new data
   */
  _handleData(subscriber: ?SubscriptionCallbacks): void {
    subscriber && subscriber.onNext(this._data);
  }

  /**
    * Calls `onError` on all subscribers informing them that the observed data
    * is gone from the store.
    */
  _handleError(subscriber: ?SubscriptionCallbacks): void {
    subscriber && this._lastError && subscriber.onError(this._lastError);
  }

  /**
   * Registers a change listener for a set of data ids. A previous listener will
   * be unregistered.
   */
  _registerChangeListener(dataIDs: Array<DataID>): void {
    this._unregisterChangeListener();

    if (dataIDs.length) {
      this._changeListener = GraphQLStoreChangeEmitter.addListenerForIDs(
        dataIDs,
        this._handleChange
      );
    }
  }

  /**
   * Unregisters the current change listener.
   */
  _unregisterChangeListener(): void {
    if (this._changeListener) {
      this._changeListener.remove();
      this._changeListener = null;
    }
  }

  /**
   * Reads data from the store and registers a change listener for all the data
   * ids that are in the subtree below the root data.
   */
  _watchQueryData(): void {
    var {data, dataIDs} = this._readQueryData();

    if (data === undefined) {
      this._lastError = RelayError.create(
        'RelayObserverError',
        this._changeListener !== null ?
          'Record `%s` was purged from the store.' :
          'Record `%s` has not been fetched.',
        this._dataID
      );

      // Stop watching for data once an error occurred, the store is in an
      // invalid state and it is not guaranteed it will ever recover
      this._unregisterChangeListener();
      // Decrease count for all dataIDs observed by this observable
      this._updateGarbageCollectorSubscriptionCount({});
      // No longer observing any dataIDs
      this._observedDataIDs = {};
      return;
    }

    this._data = data;
    this._registerChangeListener(Object.keys(dataIDs));
    this._updateGarbageCollectorSubscriptionCount(dataIDs);
    // Only observing dataIDs returned by `readQueryData`
    this._observedDataIDs = dataIDs;
  }

  /**
   * Calculates the added and removed dataIDs between `nextDataIDs` and
   * `this._currentDataIDs`.
   * For all added DataIDs the subscription-count in the garbage collector will
   * be increased, for each removed DataID the count will be decreased.
   */
  _updateGarbageCollectorSubscriptionCount(
    nextDataIDs: {[dataID: DataID]: any},
  ): void {
    if (this._garbageCollector) {
      var garbageCollector = this._garbageCollector;

      var prevDataIDs = this._observedDataIDs;
      var [removed, added] = filterExclusiveKeys(prevDataIDs, nextDataIDs);

      added.forEach(id => garbageCollector.increaseSubscriptionsFor(id));
      removed.forEach(id => garbageCollector.decreaseSubscriptionsFor(id));
    }
  }
}

module.exports = observeRelayQueryData;
