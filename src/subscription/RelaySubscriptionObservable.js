/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelaySubscriptionObservable
 * @flow
 */

'use strict';

import type {ConcreteSubscription} from 'ConcreteQuery';
import type RelayStoreData from 'RelayStoreData';
import type RelaySubscription from 'RelaySubscription';
import type RelaySubscriptionObserver from 'RelaySubscriptionObserver';
import type {
  RelayMutationConfig,
  RelaySubscriptionObservableCallbacks,
  Subscription,
  SubscriptionResult,
  Variables,
} from 'RelayTypes';

const invariant = require('invariant');
const QueryBuilder = require('QueryBuilder');
const RelayQuery = require('RelayQuery');
const RelaySubscriptionQuery = require('RelaySubscriptionQuery');
const RelaySubscriptionRequest = require('RelaySubscriptionRequest');

/**
 * An Rx Observable representing the results of a RelaySubscription.
 * Subscribers are notified as follows:
 *
 * `onNext`: Called with the latest results of a RelaySubscription. Results will be of type SubscriptionResult.
 * `Relay.Store.NetworkLayer.sendSubscription`
 * - Called synchronously on first `subscribe()`.
 * - Called whenever the results of the RelaySubscription are received.
 *
 * `onError`: Called if the RelaySubscription gets an error and no more results will be received.
 *
 * `onCompleted`: Called when the RelaySubscription has completed successfully and no more results will be recieved.
 *
 * @see http://reactivex.io/documentation/observable.html
 */
class RelaySubscriptionObservable {
  _inputVariable: ?Variables;
  _observer: RelaySubscriptionObserver;
  _storeData: RelayStoreData;
  _subscription: RelaySubscription<any>;
  _subscriptionCallbacks: Array<RelaySubscriptionObservableCallbacks>;
  _subscriptionCallName: ?string;
  _subscriptionConfigs: ?Array<RelayMutationConfig>;
  _subscriptionCount: number;
  _subscriptionDisposable: ?Subscription;
  _subscriptionNode: ?ConcreteSubscription;
  _subscriptionQuery: ?RelayQuery.Subscription;

  constructor(
    observer: RelaySubscriptionObserver,
    storeData: RelayStoreData,
    subscription: RelaySubscription<any>,
  ) {
    this._inputVariable = null;
    this._observer = observer;
    this._storeData = storeData;
    this._subscription = subscription;
    this._subscriptionCallbacks = [];
    this._subscriptionCallName = null;
    this._subscriptionConfigs = null;
    this._subscriptionCount = 0;
    this._subscriptionDisposable = null;
    this._subscriptionNode = null;
    this._subscriptionQuery = null;
  }

  /**
   * Get relay subscription
   */
  getSubscription(): RelaySubscription<any> {
    return this._subscription;
  }

  /**
   * Subscribe to the subscription
   */
  subscribe(callbacks: RelaySubscriptionObservableCallbacks): Subscription {
    this._subscriptionCount++;
    const subscriptionIndex = this._subscriptionCallbacks.length;
    this._subscriptionCallbacks.push(callbacks);
    const subscribeDisposable = {
      dispose: () => {
        invariant(
          this._subscriptionCallbacks[subscriptionIndex],
          'RelayQueryResultObservable: Subscriptions may only be disposed once.',
        );
        delete this._subscriptionCallbacks[subscriptionIndex];
        this._subscriptionCount--;
        if (this._subscriptionCount === 0) {
          this._observer.unobserve(this._subscription);
        }
      },
    };

    if (this._subscriptionCount === 1) {
      this._observe();
    }

    return subscribeDisposable;
  }

  /**
   * Dispose underlying RelaySubscription subscription
   */
  unobserve(): void {
    if (this._subscriptionDisposable) {
      this._subscriptionDisposable.dispose();
      this._subscriptionDisposable = null;
    }
  }

  /**
   * Get subscription node call name and caches it.
   */
  _getCallName(): string {
    if (!this._subscriptionCallName) {
      this._subscriptionCallName = this._getSubscriptionNode().calls[0].name;
    }
    return this._subscriptionCallName;
  }

  /**
   * Get subscription configs and caches it.
   */
  _getConfigs(): Array<RelayMutationConfig> {
    if (!this._subscriptionConfigs) {
      this._subscriptionConfigs = this._subscription.getConfigs();
    }
    return this._subscriptionConfigs;
  }

  /**
   * Gets the built subscription query and caches it.
   */
  _getQuery(): RelayQuery.Subscription {
    if (!this._subscriptionQuery) {
      const subscriptionQuery = RelaySubscriptionQuery.buildQuery({
        configs: this._getConfigs(),
        subscription: this._getSubscriptionNode(),
        input: this._getInputVariable(),
      });
      this._subscriptionQuery = subscriptionQuery;
    }
    return this._subscriptionQuery;
  }

  /**
   * Gets the built subscription query and caches it.
   */
  _getSubscriptionNode(): ConcreteSubscription {
    if (!this._subscriptionNode) {
      const subscriptionNode = QueryBuilder.getSubscription(this._subscription.getSubscription());
      invariant(
        subscriptionNode,
        'RelaySubscriptionObservable: Expected `getSubscription` to return a subscription created ' +
        'with Relay.QL`subscription { ... }`.'
      );
      this._subscriptionNode = subscriptionNode;
    }
    return this._subscriptionNode;
  }

  /**
   * Get subscripton input variable and caches it.
   */
  _getInputVariable(): Variables {
    if (!this._inputVariable) {
      this._inputVariable = this._subscription.getVariables();
    }
    return this._inputVariable;
  }

  /**
   * Send RelaySubscription and setup callbacks
   */
  _observe(): void {
    const subscriptionRequest = new RelaySubscriptionRequest(this._getQuery(), {
      onCompleted: this._onCompleted.bind(this),
      onError: this._onError.bind(this),
      onNext: this._onNext.bind(this),
    });
    this._subscriptionDisposable = this._storeData.getNetworkLayer().sendSubscription(subscriptionRequest);
  }

  /**
   * Handle RelaySubscription completed
   */
  _onCompleted(): void {
    this._subscriptionCallbacks.forEach(callbacks => (callbacks.onCompleted && callbacks.onCompleted()));
  }

  /**
   * Handle next RelaySubscription SubscriptionResult
   */
  _onError(error: Error): void {
    this._subscriptionCallbacks.forEach(callbacks => (callbacks.onError && callbacks.onError(error)));
  }

  /**
   * Handle RelaySubscription Error
   */
  _onNext(response: SubscriptionResult): void {
    this._storeData.handleUpdatePayload(this._getQuery(), response[this._getCallName()], {
      configs: this._getConfigs(),
      isOptimisticUpdate: false,
    });
    this._subscriptionCallbacks.forEach(callbacks => (callbacks.onNext && callbacks.onNext(response)));
  }
}

module.exports = RelaySubscriptionObservable;
