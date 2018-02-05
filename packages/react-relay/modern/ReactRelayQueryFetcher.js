/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');

import type {
  CacheConfig,
  Disposable,
  IEnvironment,
  OperationSelector,
  Snapshot,
} from 'RelayRuntime';

const NETWORK_ONLY = 'NETWORK_ONLY';
const STORE_THEN_NETWORK = 'STORE_THEN_NETWORK';
const DataFromEnum = {
  NETWORK_ONLY,
  STORE_THEN_NETWORK,
};

export type DataFrom = $Keys<typeof DataFromEnum>;

export type FetchOptions = {
  cacheConfig?: ?CacheConfig,
  dataFrom?: DataFrom,
  environment: IEnvironment,
  onDataChange: ({error?: Error, snapshot?: Snapshot}) => void,
  operation: OperationSelector,
};

class ReactRelayQueryFetcher {
  static DataFrom = DataFromEnum;

  _cacheReference: ?Disposable;
  _fetchOptions: ?FetchOptions;
  _pendingRequest: ?Disposable;
  _rootSubscription: ?Disposable;
  _selectionReferences: Array<Disposable> = [];
  _snapshot: ?Snapshot; // results of the root fragment;

  /**
   * `fetch` fetches the data for the given operation.
   * If a result is immediately available synchronously, it will be synchronously
   * returned by this function.
   *
   * Otherwise, the fetched result will be communicated via the `onDataChange` callback.
   * `onDataChange` will be called with the first result (**if it wasn't returned synchronously**),
   * and then subsequently whenever the data changes.
   */
  fetch(fetchOptions: FetchOptions): ?Snapshot {
    const {
      cacheConfig,
      dataFrom = NETWORK_ONLY,
      environment,
      onDataChange,
      operation,
    } = fetchOptions;
    const {createOperationSelector} = environment.unstable_internal;
    const nextReferences = [];
    let fetchHasReturned = false;
    let error;

    this._disposeRequest();
    this._fetchOptions = fetchOptions;

    // Check if we can fulfill this query with data already available in memory,
    // and immediatly return data if so
    if (dataFrom === STORE_THEN_NETWORK && environment.check(operation.root)) {
      this._cacheReference = environment.retain(operation.root);
      // Don't notify the first result because it will be returned synchronously
      this._onQueryDataAvailable({notifyFirstResult: false});
    }

    const request = environment
      .execute({operation, cacheConfig})
      .finally(() => {
        this._pendingRequest = null;
        this._disposeCacheReference();
      })
      .subscribe({
        next: payload => {
          const operationForPayload = createOperationSelector(
            operation.node,
            payload.variables,
            payload.operation,
          );
          nextReferences.push(environment.retain(operationForPayload.root));
          this._disposeCacheReference();

          // Only notify of the first result if `next` is being called **asynchronously**
          // (i.e. after `fetch` has returned).
          this._onQueryDataAvailable({notifyFirstResult: fetchHasReturned});
        },
        error: err => {
          // We may have partially fulfilled the request, so let the next request
          // or the unmount dispose of the references.
          this._selectionReferences = this._selectionReferences.concat(
            nextReferences,
          );

          // Only notify of error if `error` is being called **asynchronously**
          // (i.e. after `fetch` has returned).
          if (fetchHasReturned) {
            onDataChange({error: err});
          } else {
            error = err;
          }
        },
        complete: () => {
          this._disposeSelectionReferences();
          this._selectionReferences = nextReferences;
        },
        unsubscribe: () => {
          // Let the next request or the unmount code dispose of the references.
          // We may have partially fulfilled the request.
          this._selectionReferences = this._selectionReferences.concat(
            nextReferences,
          );
        },
      });

    this._pendingRequest = {
      dispose() {
        request.unsubscribe();
      },
    };

    fetchHasReturned = true;
    if (error) {
      throw error;
    }
    return this._snapshot;
  }

  retry(): ?Snapshot {
    invariant(
      this._fetchOptions,
      'ReactRelayQueryFetcher: `retry` should be called after having called `fetch`',
    );
    return this.fetch(this._fetchOptions);
  }

  dispose() {
    this._disposeRequest();
    this._disposeSelectionReferences();
  }

  _disposeCacheReference() {
    if (this._cacheReference) {
      this._cacheReference.dispose();
      this._cacheReference = null;
    }
  }

  _disposeRequest() {
    this._snapshot = null;
    this._disposeCacheReference();

    // order is important, dispose of pendingFetch before selectionReferences
    if (this._pendingRequest) {
      this._pendingRequest.dispose();
    }
    if (this._rootSubscription) {
      this._rootSubscription.dispose();
      this._rootSubscription = null;
    }
  }

  _disposeSelectionReferences() {
    this._selectionReferences.forEach(r => r.dispose());
    this._selectionReferences = [];
  }

  _onQueryDataAvailable({notifyFirstResult}: {notifyFirstResult: boolean}) {
    invariant(
      this._fetchOptions,
      'ReactRelayQueryFetcher: `_onQueryDataAvailable` should have been called after having called `fetch`',
    );
    const {environment, onDataChange, operation} = this._fetchOptions;

    // `_onQueryDataAvailable` can be called synchronously the first time and can be called
    // multiple times by network layers that support data subscriptions.
    // Wait until the first payload to call `onDataChange` and subscribe for data updates.
    if (this._snapshot) {
      return;
    }
    this._snapshot = environment.lookup(operation.fragment);

    // Subscribe to changes in the data of the root fragment
    this._rootSubscription = environment.subscribe(this._snapshot, snapshot =>
      onDataChange({snapshot}),
    );

    if (this._snapshot && notifyFirstResult) {
      onDataChange({snapshot: this._snapshot});
    }
  }
}

module.exports = ReactRelayQueryFetcher;
