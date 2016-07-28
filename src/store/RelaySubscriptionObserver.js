/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelaySubscriptionObserver
 * @flow
 */

'use strict';

import type RelayStoreData from 'RelayStoreData';
import type RelaySubscription from 'RelaySubscription';
const RelaySubscriptionObservable = require('RelaySubscriptionObservable');

 /**
  * @internal
  *
  * Central class for observing subscriptions. Keeps track of all active subscriptions
  * and their observables. Ensures that subscription observables are not duplicated.
  */
class RelaySubscriptionObserver {
  _storeData: RelayStoreData;
  _observables: Array<RelaySubscriptionObservable>;

  constructor(
    storeData: RelayStoreData,
  ) {
    this._observables = [];
    this._storeData = storeData;
  }

  /**
   * Observe a subscription, ensures that subscriptions is not already being observed
   */
  observe(
    subscription: RelaySubscription<any>
  ): RelaySubscriptionObservable {
    let observable = this._observables.find(observable => observable.getSubscription() === subscription);
    if (!observable) {
      observable = new RelaySubscriptionObservable(
        this,
        this._storeData,
        subscription,
      );
      this._observables.push(observable);
    }
    return observable;
  }

  /**
   * Unobserve a subscription, detach observable
   */
  unobserve(
    subscription: RelaySubscription<any>
  ): void {
    const observableIndex = this._observables.findIndex(observable => observable.getSubscription() === subscription);
    if (observableIndex >= 0) {
      this._observables[observableIndex].unobserve();
      this._observables.splice(observableIndex, 1);
    }
  }
}

module.exports = RelaySubscriptionObserver;
