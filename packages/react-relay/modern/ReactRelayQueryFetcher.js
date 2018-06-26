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

import type {ExecutePayload} from 'RelayNetworkTypes';
import type {
  CacheConfig,
  Disposable,
  IEnvironment,
  OperationSelector,
  Snapshot,
} from 'RelayRuntime';
import type {Observable} from 'RelayRuntime';

type OnDataChange = null | (({error?: Error, snapshot?: Snapshot}) => void);

export type FetchOptions = {
  cacheConfig?: ?CacheConfig,
  environment: IEnvironment,
  onDataChange: OnDataChange,
  operation: OperationSelector,
};

export type ExecuteConfig = {|
  environment: IEnvironment,
  operation: OperationSelector,
  cacheConfig?: ?CacheConfig,
  // Allows pagination container to retain results from previous queries
  preservePreviousReferences?: boolean,
|};

class ReactRelayQueryFetcher {
  _fetchOptions: ?FetchOptions;
  _pendingRequest: ?Disposable;
  _rootSubscription: ?Disposable;
  _selectionReferences: Array<Disposable> = [];
  _snapshot: ?Snapshot; // results of the root fragment;
  _error: ?Error; // fetch error
  _cacheSelectionReference: ?Disposable;
  _callOnDataChangeWhenSet: boolean = false;

  lookupInStore(
    environment: IEnvironment,
    operation: OperationSelector,
  ): ?Snapshot {
    if (environment.check(operation.root)) {
      this._retainCachedOperation(environment, operation);
      return environment.lookup(operation.fragment);
    }
    return null;
  }

  execute({
    environment,
    operation,
    cacheConfig,
    preservePreviousReferences = false,
  }: ExecuteConfig): Observable<ExecutePayload> {
    const {createOperationSelector} = environment.unstable_internal;
    const nextReferences = [];

    return environment
      .execute({operation, cacheConfig})
      .map(payload => {
        const operationForPayload = createOperationSelector(
          operation.node,
          payload.variables,
          payload.operation,
        );
        nextReferences.push(environment.retain(operationForPayload.root));
        return payload;
      })
      .do({
        error: () => {
          // We may have partially fulfilled the request, so let the next request
          // or the unmount dispose of the references.
          this._selectionReferences = this._selectionReferences.concat(
            nextReferences,
          );
        },
        complete: () => {
          if (!preservePreviousReferences) {
            this._disposeSelectionReferences();
          }
          this._selectionReferences = this._selectionReferences.concat(
            nextReferences,
          );
        },
        unsubscribe: () => {
          // Let the next request or the unmount code dispose of the references.
          // We may have partially fulfilled the request.
          this._selectionReferences = this._selectionReferences.concat(
            nextReferences,
          );
        },
      });
  }

  setOnDataChange(onDataChange: OnDataChange): void {
    invariant(
      this._fetchOptions,
      'ReactRelayQueryFetcher: `setOnDataChange` should have been called after having called `fetch`',
    );

    // Mutate the most recent fetchOptions in place,
    // So that in-progress requests can access the updated callback.
    this._fetchOptions.onDataChange = onDataChange;

    if (this._callOnDataChangeWhenSet && typeof onDataChange === 'function') {
      this._callOnDataChangeWhenSet = false;
      if (this._error != null) {
        onDataChange({error: this._error});
      } else if (this._snapshot != null) {
        onDataChange({snapshot: this._snapshot});
      }
    }
  }

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
    const {cacheConfig, environment, operation} = fetchOptions;
    let fetchHasReturned = false;
    let error;

    this._disposeRequest();
    this._fetchOptions = fetchOptions;

    const request = this.execute({
      environment,
      operation,
      cacheConfig,
    })
      .finally(() => {
        this._pendingRequest = null;
      })
      .subscribe({
        next: () => {
          const onDataChange = this._fetchOptions
            ? this._fetchOptions.onDataChange
            : null;

          // If we received a response when we didn't have a change callback,
          // Make a note that to notify the callback when it's later added.
          this._callOnDataChangeWhenSet = typeof onDataChange !== 'function';
          this._error = null;

          // Only notify of the first result if `next` is being called **asynchronously**
          // (i.e. after `fetch` has returned).
          this._onQueryDataAvailable({notifyFirstResult: fetchHasReturned});
        },
        error: err => {
          const onDataChange = this._fetchOptions
            ? this._fetchOptions.onDataChange
            : null;

          // If we received a response when we didn't have a change callback,
          // Make a note that to notify the callback when it's later added.
          this._callOnDataChangeWhenSet = typeof onDataChange !== 'function';
          this._error = err;
          this._snapshot = null;

          // Only notify of error if `error` is being called **asynchronously**
          // (i.e. after `fetch` has returned).
          if (fetchHasReturned) {
            if (typeof onDataChange === 'function') {
              onDataChange({error: err});
            }
          } else {
            error = err;
          }
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

  _disposeRequest() {
    this._error = null;
    this._snapshot = null;

    // order is important, dispose of pendingFetch before selectionReferences
    if (this._pendingRequest) {
      this._pendingRequest.dispose();
    }
    if (this._rootSubscription) {
      this._rootSubscription.dispose();
      this._rootSubscription = null;
    }
  }

  _retainCachedOperation(
    environment: IEnvironment,
    operation: OperationSelector,
  ) {
    this._disposeCacheSelectionReference();
    this._cacheSelectionReference = environment.retain(operation.root);
  }

  _disposeCacheSelectionReference() {
    this._cacheSelectionReference && this._cacheSelectionReference.dispose();
    this._cacheSelectionReference = null;
  }

  _disposeSelectionReferences() {
    this._disposeCacheSelectionReference();
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
    this._rootSubscription = environment.subscribe(this._snapshot, snapshot => {
      // Read from this._fetchOptions in case onDataChange() was lazily added.
      if (this._fetchOptions != null) {
        const maybeNewOnDataChange = this._fetchOptions.onDataChange;
        if (typeof maybeNewOnDataChange === 'function') {
          maybeNewOnDataChange({snapshot});
        }
      }
    });

    if (
      this._snapshot &&
      notifyFirstResult &&
      typeof onDataChange === 'function'
    ) {
      onDataChange({snapshot: this._snapshot});
    }
  }
}

module.exports = ReactRelayQueryFetcher;
