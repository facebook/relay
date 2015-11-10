/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayDeferredFragmentState
 * @flow
 * @typechecks
 */

import type {DataID} from 'RelayInternalTypes';
import type GraphQLDeferredQueryTracker from 'GraphQLDeferredQueryTracker';
import type RelayPendingQueryTracker from 'RelayPendingQueryTracker';

var forEachObject = require('forEachObject');

export type RelayDeferredFragmentStateOptions = {
  onSuccess: () => void;
  onFailure: () => void,
};

class RelayDeferredFragmentState {
  _deferredErrors: {[key: string]: Error};
  _deferredSubscriptions: {[key: string]: any};
  _deferredQueryTracker: GraphQLDeferredQueryTracker;
  _options: RelayDeferredFragmentStateOptions;
  _pendingQueryTracker: RelayPendingQueryTracker;

  constructor(
    deferredQueryTracker: GraphQLDeferredQueryTracker,
    pendingQueryTracker: RelayPendingQueryTracker,
    options: RelayDeferredFragmentStateOptions = {
      onSuccess: () => {},
      onFailure: () => {},
    }
  ) {
    this._deferredErrors = {};
    this._deferredSubscriptions = {};
    this._deferredQueryTracker = deferredQueryTracker;
    this._options = options;
    this._pendingQueryTracker = pendingQueryTracker;
  }

  getFragmentError(dataID: DataID, fragmentID: string): ?Error {
    var subscriptionKey = getSubscriptionKey(dataID, fragmentID);
    return this._deferredErrors[subscriptionKey];
  }

  hasFragmentData(dataID: DataID, fragmentID: string): boolean {
    var hasKeys = false;
    for (var key in this._deferredSubscriptions) {
      if (this._deferredSubscriptions.hasOwnProperty(key)) {
        hasKeys = true;
        break;
      }
    }
    if (!this._pendingQueryTracker.hasPendingQueries() && !hasKeys) {
      return true;
    }
    var hasData = !this._deferredQueryTracker.isQueryPending(
      dataID,
      fragmentID
    );
    var subscriptionKey = getSubscriptionKey(dataID, fragmentID);
    if (!hasData) {
      // Query is pending: subscribe for updates to any missing deferred data.
      if (!this._deferredSubscriptions.hasOwnProperty(subscriptionKey)) {
        this._deferredSubscriptions[subscriptionKey] =
          this._deferredQueryTracker.addListenerForFragment(
            dataID,
            fragmentID,
            {
              onSuccess: this._handleDeferredSuccess.bind(this),
              onFailure: this._handleDeferredFailure.bind(this),
            }
          );
      }
    } else {
      // query completed: check for errors
      if (this._deferredErrors.hasOwnProperty(subscriptionKey)) {
        hasData = false;
      }
    }
    return hasData;
  }

  remove(): void {
    forEachObject(this._deferredSubscriptions, subscription => {
      subscription && subscription.remove();
    });
    this._deferredErrors = {};
    this._deferredSubscriptions = {};
  }

  _handleDeferredSuccess(
    dataID: string,
    fragmentID: string
  ): void {
    var subscriptionKey = getSubscriptionKey(dataID, fragmentID);
    if (this._deferredSubscriptions.hasOwnProperty(subscriptionKey)) {
      this._deferredSubscriptions[subscriptionKey].remove();
      delete this._deferredSubscriptions[subscriptionKey];
      this._options.onSuccess();
    }
  }

  _handleDeferredFailure(
    dataID: string,
    fragmentID: string,
    error: Error
  ): void {
    var subscriptionKey = getSubscriptionKey(dataID, fragmentID);
    this._deferredErrors[subscriptionKey] = error;
    this._options.onFailure();
  }
}

/**
* Constructs a unique key for a deferred subscription.
*/
function getSubscriptionKey(dataID: DataID, fragmentID: string): string {
  return dataID + '.' + fragmentID;
}

module.exports = RelayDeferredFragmentState;
