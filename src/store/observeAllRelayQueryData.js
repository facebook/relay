/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule observeAllRelayQueryData
 * @typechecks
 * @flow
 */

 /* eslint no-unused-expressions: 1 */

'use strict';

import type {DataID} from 'RelayInternalTypes';
import type RelayQuery from 'RelayQuery';
import type RelayRecordStore from 'RelayRecordStore';
import type {
  MultiObservable,
  Observable,
  StoreReaderData,
  StoreReaderOptions,
  Subscription,
  SubscriptionCallbacks
} from 'RelayTypes';

var emptyFunction = require('emptyFunction');
var filterExclusiveKeys = require('filterExclusiveKeys');
var forEachObject = require('forEachObject');
var invariant = require('invariant');
var observeRelayQueryData = require('observeRelayQueryData');

type BoundObserveRelayQueryData =
  (dataID: DataID) => Observable;
type DataIDToObserverMap = {[dataID: DataID]: ?Observable;};
type DataIDToSubscriptionIndexMap = {[dataID: DataID]: number};
type DataIDToSubscriptionsMap = {[dataID: DataID]: ?Array<Subscription>};
type SubscribeCall = {
  callbacks: SubscriptionCallbacks;
  dataIDToSubscriptionIndex: DataIDToSubscriptionIndexMap;
};
type WrappedData = {[dataID: DataID]: ?StoreReaderData};

var DATAID_REMOVED = {};

function observeAllRelayQueryData(
  store: RelayRecordStore,
  queryNode: RelayQuery.Node,
  dataIDs: Array<DataID>,
  options?: StoreReaderOptions
): MultiObservable<?StoreReaderData> {
  return new RelayQueryMultipleDataObservable(
    dataID => observeRelayQueryData(store, queryNode, dataID, options),
    dataIDs
  );
}

class RelayQueryMultipleDataObservable {
  _activeSubscriptions: number;
  _dataIDs: Array<DataID>;
  _isDisposed: boolean;
  _lastError: ?Error;
  _observeRelayQueryData: BoundObserveRelayQueryData;
  _observers: ?DataIDToObserverMap;
  _shouldExecuteCallbacks: boolean;
  _subscribeCalls: Array<?SubscribeCall>;
  _subscriptions: DataIDToSubscriptionsMap;
  _wrappedData: WrappedData;

  constructor(
    observeRelayQueryData: BoundObserveRelayQueryData,
    dataIDs: Array<DataID>
  ) {
    this._activeSubscriptions = 0;
    this._dataIDs = Object.keys(toObject(dataIDs));
    this._lastError = null;
    this._observeRelayQueryData = observeRelayQueryData;
    this._observers = null;
    this._shouldExecuteCallbacks = false;
    this._subscribeCalls = [];
    this._subscriptions = {};
    this._wrappedData = {};
  }

  subscribe(
    callbacks: SubscriptionCallbacks<Array<?StoreReaderData>>
  ): Subscription {
    // An error occurred earlier, it is no longer possible to subscribe to this
    // observer
    if (this._lastError) {
      callbacks.onError(this._lastError);
      return {
        dispose: emptyFunction
      };
    }

    // Only create observers on the first subscribe call
    if (!this._observers) {
      this._setupObservers(this._dataIDs);
    }

    // List of indices of where in the list of subscription per dataID this
    // subscription is
    var dataIDToSubscriptionIndex = {};
    this._addSubscriptions(this._dataIDs, dataIDToSubscriptionIndex, callbacks);

    // An error occurred while creating the subscriptions, rolling back
    if (this._lastError) {
      callbacks.onError(this._lastError);
      this._disposeSubscriptions(dataIDToSubscriptionIndex);
      return {
        dispose: emptyFunction
      };
    }
    this._subscribeCalls.push({callbacks, dataIDToSubscriptionIndex});

    callbacks.onNext(unwrapData(this._wrappedData));
    var index = this._subscribeCalls.length - 1;
    var isDisposed = false;
    this._activeSubscriptions++;

    return {
      dispose: () => {
        invariant(
          !isDisposed,
          'RelayObserver.dispose(): Subscription was already disposed.'
        );
        isDisposed = true;

        this._activeSubscriptions--;
        this._disposeSubscriptions(dataIDToSubscriptionIndex);
        this._subscribeCalls[index] = null;

        if (!this._activeSubscriptions) {
          this._observers = null;
          this._subscribeCalls = [];
          this._subscriptions = {};
          this._wrappedData = {};
        }
      }
    };
  }

  /**
   * Changes the observed dataIDs to the given dataIDs, the order of the new
   * dataIDs is kept.
   */
  setDataIDs(dataIDs: Array<DataID>): void {
    invariant(
      !this._lastError,
      'RelayObserver.setDataIDs(): Unable to update records on a defunct ' +
      'observer.'
    );
    var dataIDSet = toObject(dataIDs);
    this._dataIDs = Object.keys(dataIDSet);

    var [removedDataIDs, addedDataIDs] =
      filterExclusiveKeys(this._observers, dataIDSet);

    // Unsubscribe subscriptions for removed data IDs
    removedDataIDs.forEach(dataID => {
      var subscriptions = this._subscriptions[dataID];
      if (subscriptions) {
        subscriptions.forEach(subscription => {
          subscription && subscription.dispose();
          this._wrappedData[dataID] = DATAID_REMOVED;
        });
        this._subscriptions[dataID] = null;
      }
    });

    this._setupObservers(addedDataIDs);
    this._subscribeCalls.forEach(call => {
      // Add the dataIDs to any previously attached callbacks
      call && this._addSubscriptions(
        addedDataIDs,
        call.dataIDToSubscriptionIndex
      );
    });

    // All subscriptions have been added and data has been ordered, invoke
    // callback on all subscriptions
    if (this._lastError) {
      this._callOnError();
    } else {
      this._wrappedData = reorderObjectKeys(this._dataIDs, this._wrappedData);
      this._callOnNext();
    }
  }

  /**
   * Adds subscriptions for dataIDs that were added after the initial call to
   * `subscribe`.
   */
  _addSubscriptions(
    dataIDs: Array<DataID>,
    indices: {[dataID: DataID]: number}
  ) {
    this._shouldExecuteCallbacks = false;
    dataIDs.forEach(dataID => {
      if (this._observers) {
        var observer = this._observers[dataID];
        if (observer) {
          var subscriptions =
            this._subscriptions[dataID] || (this._subscriptions[dataID] = []);
          // The index the subscription will be stored at in the array.
          indices[dataID] = subscriptions.length;
          subscriptions.push(observer.subscribe({
            onCompleted: () => this._handleCompleted(dataID),
            onError: error => this._handleError(dataID, error),
            onNext: data => this._handleNext(dataID, data)
          }));
        }
      }
    });
    this._shouldExecuteCallbacks = true;
  }

  /**
   * Calls `onError` on all subscriptions but only if `_shouldExecuteCallbacks`
   * is `true`. This is handy to prevent excessive calls of `onError` when
   * observed DataIDs change
   */
  _callOnError(): void {
    this._shouldExecuteCallbacks && this._subscribeCalls.forEach(call => {
      call && this._lastError && call.callbacks.onError(this._lastError);
    });
  }

  /**
   * Calls `onNext` on all subscriptions but only if `_shouldExecuteCallbacks`
   * is `true`. This is handy to prevent excessive calls of `onNext` when
   * observed DataIDs change
   */
  _callOnNext(): void {
    this._shouldExecuteCallbacks && this._subscribeCalls.forEach(call => {
      if (call) {
        call.callbacks.onNext(unwrapData(this._wrappedData));
      }
    });
  }

  /**
   * Remove a set of subscriptions based on their dataID
   */
  _disposeSubscriptions(indices: {[dataID: DataID]: number}): void {
    forEachObject(indices, (index, dataID) => {
      var subscriptions = this._subscriptions[dataID];
      if (subscriptions && subscriptions[index]) {
        subscriptions[index].dispose();
        subscriptions[index] = null;
      }
    });
  }

  _handleCompleted(dataID: DataID): void {
    this._subscribeCalls.forEach(call => {
      call && call.callbacks.onCompleted();
    });
  }

  /**
   * Notify all subscribers that an error occurred
   */
  _handleError(dataID: DataID, error: Error): void {
    this._lastError = error;
    this._callOnError();
  }

  _handleNext(dataID: DataID, data: ?StoreReaderData): void {
    this._wrappedData[dataID] = data;
    this._callOnNext();
  }

  /**
   * Creates observers for the given dataIDs, if an observer for the given
   * dataID already exists nothing will be done for this dataID
   */
  _setupObservers(dataIDs: Array<DataID>): void {
    if (!this._observers) {
      this._observers = {};
    }
    dataIDs.forEach(dataID => {
      var observer = this._observeRelayQueryData(dataID);
      // Additional check if dataIDToObserver exists for Flow
      if (this._observers) {
        this._observers[dataID] = observer;
      }
    });
  }
}

/**
 * Returns a new object with the keys in the same order as they appear in
 * `reference`.
 */
function reorderObjectKeys(
  reference: Array<string>,
  input: {[dataID: DataID]: any}
): {[dataID: DataID]: any} {
  var orderedInput = {};
  reference.forEach(key => {
    invariant(
      input.hasOwnProperty(key),
      'RelayObserver.setDataIDs(): Expected object to have key `%s`.',
      key
    );
    orderedInput[key] = input[key];
  });
  return orderedInput;
}

function toObject(dataIDs: Array<DataID>): {[dataID: DataID]: any} {
  var dataIDSet = {};
  dataIDs.forEach(dataID => {
    dataIDSet[dataID] = null;
  });
  return dataIDSet;
}

function unwrapData(wrappedData: WrappedData): Array<?StoreReaderData> {
  var unwrappedData = [];
  forEachObject(wrappedData, data => {
    if (data !== DATAID_REMOVED) {
      unwrappedData.push(data);
    }
  });
  return unwrappedData;
}

module.exports = observeAllRelayQueryData;
