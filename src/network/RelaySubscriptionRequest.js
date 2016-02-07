/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelaySubscriptionRequest
 * @typechecks
 * @flow
 */

'use strict';

import type {PrintedQuery} from 'RelayInternalTypes';
import type RelayQuery from 'RelayQuery';
import type {
  Subscription,
  SubscriptionResult,
  SubscriptionCallbacks,
  Variables,
} from 'RelayTypes';

const invariant = require('invariant');
const printRelayQuery = require('printRelayQuery');

/**
 * @internal
 *
 * Instances of these are made available via `RelayNetworkLayer.sendSubscription`.
 */
class RelaySubscriptionRequest {
  _active: boolean;
  _disposable: ?Subscription;
  _disposed: boolean;
  _observers: Array<SubscriptionCallbacks<SubscriptionResult>>;
  _observersCount: number;
  _printedQuery: ?PrintedQuery;
  _subscription: RelayQuery.Subscription;

  constructor(
    subscription: RelayQuery.Subscription,
  ) {
    this._active = true;
    this._disposable = null;
    this._disposed = false;
    this._observers = [];
    this._observersCount = 0;
    this._printedQuery = null;
    this._subscription = subscription;
  }

  /**
   * @public
   *
   * Gets a string name used to refer to this request for printing debug output.
   */
  getDebugName(): string {
    return this._subscription.getName();
  }

  /**
   * @public
   *
   * Gets the variables used by the subscription. These variables should be
   * serialized and sent in the GraphQL request.
   */
  getVariables(): Variables {
    let printedQuery = this._printedQuery;
    if (!printedQuery) {
      printedQuery = printRelayQuery(this._subscription);
      this._printedQuery = printedQuery;
    }
    return printedQuery.variables;
  }

  /**
   * @public
   *
   * Gets a string representation of the GraphQL subscription.
   */
  getQueryString(): string {
    let printedQuery = this._printedQuery;
    if (!printedQuery) {
      printedQuery = printRelayQuery(this._subscription);
      this._printedQuery = printedQuery;
    }
    return printedQuery.text;
  }

  /**
   * @public
   *
   *
   */
  subscribe(observer: SubscriptionCallbacks<SubscriptionResult>): Subscription {
    invariant(
      this._active,
      'RelaySubscriptionRequest: Cannot subscribe to disposed subscription.'
    );

    const observerIndex = this._observers.length;
    this._observers.push(observer);
    this._observersCount += 1;

    return {
      dispose: () => {
        invariant(
          this._observers[observerIndex],
          'RelaySubscriptionRequest: Subscriptions may only be disposed once.'
        );
        delete this._observers[observerIndex];
        this._observersCount -= 1;
        if (this._observersCount === 0) {
          this.dispose();
        }
      },
    };
  }

  /**
   * @internal
   *
   *
   */
  dispose() {
    this._active = false;
    if (!this._disposed) {
      this._disposed = true;
      if (this._disposable) {
        this._disposable.dispose();
      }
    }
  }

  /**
   * @internal
   *
   *
   */
  setDisposable(disposable: Subscription): void {
    invariant(
      !this._disposable,
      'RelaySubscriptionRequest: attempting to set disposable more than once'
    );

    this._disposable = disposable;
    if (this._disposed) {
      this._disposable.dispose();
    }
  }

  /**
   * @public
   *
   * Called when new event data is received for the subscription.
   */
  onNext(result: SubscriptionResult): void {
    if (this._active) {
      try {
        this._observers.forEach(observer => {
          observer.onNext && observer.onNext(result);
        });
      } catch (e) {
        this.dispose();
        throw e;
      }
    }
  }

  /**
   * @public
   *
   * Called when there is an error with the subscription.  Ends the
   * subscription.
   */
  onError(err: any): void {
    if (this._active) {
      this._active = false;
      try {
        this._observers.forEach(observer => {
          observer.onError && observer.onError(err);
        });
      } finally {
        this.dispose();
      }
    }
  }

  /**
   * @public
   *
   * Called when no more data will be provided to the subscriptions.  Ends
   * the subscription.
   */
  onCompleted(): void {
    if (this._active) {
      this._active = false;
      try {
        this._observers.forEach(observer => {
          observer.onCompleted && observer.onCompleted();
        });
      } finally {
        this.dispose();
      }
    }
  }

  /**
   * @public
   * @unstable
   */
  getSubscription(): RelayQuery.Subscription {
    return this._subscription;
  }

}

module.exports = RelaySubscriptionRequest;
