/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelaySubscriptionRequest
 * @flow
 */

'use strict';

import type {PrintedQuery} from 'RelayInternalTypes';
import type RelayQuery from 'RelayQuery';
import type {
  RelaySubscriptionObservableCallbacks,
  SubscriptionResult,
  Variables,
} from 'RelayTypes';

const printRelayQuery = require('printRelayQuery');

/**
 * @internal
 *
 * Instances of these are made available via `RelayNetworkLayer.sendSubscription`.
 */
class RelaySubscriptionRequest {
  _subscription: RelayQuery.Subscription;
  _callbacks: RelaySubscriptionObservableCallbacks;
  _printedQuery: ?PrintedQuery;

  constructor(
    subscription: RelayQuery.Subscription,
    callbacks: RelaySubscriptionObservableCallbacks,
  ) {
    this._subscription = subscription;
    this._callbacks = callbacks;
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
    return this._getPrintedQuery().variables;
  }

  /**
   * @public
   *
   * Gets a string representation of the GraphQL subscription.
   */
  getQueryString(): string {
    return this._getPrintedQuery().text;
  }

  /**
   * @public
   * @unstable
   */
  getSubscription(): RelayQuery.Subscription {
    return this._subscription;
  }

  /**
   * @public
   * @unstable
   */
  onCompleted(): void {
    return this._callbacks && this._callbacks.onCompleted();
  }

  /**
   * @public
   * @unstable
   */
  onNext(payload: SubscriptionResult): void {
    return this._callbacks && this._callbacks.onNext(payload);
  }

  /**
   * @public
   * @unstable
   */
  onError(error: Error): void {
    return this._callbacks && this._callbacks.onError(error);
  }

  /**
   * @private
   *
   * Returns the memoized printed query.
   */
  _getPrintedQuery(): PrintedQuery {
    if (!this._printedQuery) {
      this._printedQuery = printRelayQuery(this._subscription);
    }
    return this._printedQuery;
  }
}

module.exports = RelaySubscriptionRequest;
