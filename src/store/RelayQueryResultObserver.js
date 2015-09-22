/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQueryResultObserver
 * @typechecks
 * @flow
 */

'use strict';

var GraphQLFragmentPointer = require('GraphQLFragmentPointer');
var GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');
var RelayError = require('RelayError');
import type {DataID} from 'RelayInternalTypes';
var RelayQuery = require('RelayQuery');
import type RelayRecordStore from 'RelayRecordStore';
import type {
  StoreReaderData,
  Subscription,
  SubscriptionCallbacks
} from 'RelayTypes';

var invariant = require('invariant');

class RelayQueryResultObserver {
  _data: ?StoreReaderData;
  _error: ?Error;
  _fragmentPointer: GraphQLFragmentPointer;
  _queryResolver: ?GraphQLStoreQueryResolver;
  _store: RelayRecordStore;
  _subscriptionCount: number;
  _subscriptions: Array<SubscriptionCallbacks<StoreReaderData>>;

  constructor(
    store: RelayRecordStore,
    fragmentPointer: GraphQLFragmentPointer
  ) {
    this._data = undefined;
    this._error = null;
    this._fragmentPointer = fragmentPointer;
    this._queryResolver = null;
    this._store = store;
    this._subscriptionCount = 0;
    this._subscriptions = [];
  }

  subscribe(callbacks: SubscriptionCallbacks<StoreReaderData>): Subscription {
    this._subscriptionCount++;
    var subscriptionIndex = this._subscriptions.length;
    var subscription = {
      dispose: () => {
        invariant(
          this._subscriptions[subscriptionIndex],
          'RelayQueryResultObserver: Subscriptions may only be disposed once.'
        );
        delete this._subscriptions[subscriptionIndex];
        this._subscriptionCount--;
        if (this._subscriptionCount === 0) {
          this._unobserve();
        }
      },
    };
    this._subscriptions.push(callbacks);

    if (this._subscriptionCount === 1) {
      this._observe();
      this._resolveData();
    }
    if (this._error) {
      callbacks.onError && callbacks.onError(this._error);
    } else {
      callbacks.onNext && callbacks.onNext(this._data);
    }

    return subscription;
  }

  _observe() {
    if (!this._queryResolver) {
      this._queryResolver = new GraphQLStoreQueryResolver(
        this._store,
        this._fragmentPointer,
        () => this._onUpdate()
      );
    }
  }

  _unobserve() {
    if (this._queryResolver) {
      this._queryResolver.reset();
      this._queryResolver = null;
    }
  }

  _onUpdate() {
    this._resolveData();
    this._subscriptions.forEach(subscription =>  {
      if (this._error) {
        subscription.onError && subscription.onError(this._error);
      } else {
        subscription.onNext && subscription.onNext(this._data);
      }
    });

    if (this._error) {
      this._unobserve();
    }
  }

  _resolveData() {
    invariant(
      this._queryResolver,
      'RelayQueryResultObserver: Did not initialize properly.'
    );
    var prevData = this._data;
    this._data = this._queryResolver.resolve(this._fragmentPointer);
    if (this._data === undefined) {
      var fragment = this._fragmentPointer.getFragment();
      this._error = RelayError.create(
        'RelayQueryResultObserver',
        prevData === undefined ?
          'Cannot observe unfetched record(s) `%s`.' :
          'Observed record(s) `%s` was purged from the cache.',
        fragment.isPlural() ?
          this._fragmentPointer.getDataIDs() :
          this._fragmentPointer.getDataID()
      );
    }
  }
}

module.exports = RelayQueryResultObserver;
