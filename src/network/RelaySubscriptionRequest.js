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
import type {SubscriptionResult, SubscriptionCallbacks, Variables} from 'RelayTypes';

const printRelayQuery = require('printRelayQuery');

/**
 * @internal
 *
 * Instances of these are made available via `RelayNetworkLayer.sendSubscription`.
 */
class RelaySubscriptionRequest {
  _subscription: RelayQuery.Subscription;
  _printedQuery: ?PrintedQuery;
  _observer: SubscriptionCallbacks<SubscriptionResult>;

  constructor(
    subscription: RelayQuery.Subscription,
    observer: SubscriptionCallbacks<SubscriptionResult>
  ) {
    this._subscription = subscription;
    this._observer = observer;
    this._printedQuery = null;
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
   * Called when new event data is received for the subscription.
   */
  onNext(result: SubscriptionResult): void {
    this._observer.onNext(result);
  }

  /**
   * @public
   *
   * Called when there is an error with the subscription.  Ends the
   * subscription.
   */
  onError(err: any): void {
    this._observer.onError(err);
  }

  /**
   * @public
   *
   * Called when no more data will be provided to the subscriptions.  Ends
   * the subscription.
   */
  onCompleted(): void {
    this._observer.onCompleted();
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
