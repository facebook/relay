/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayNetwork
 * @flow
 * @format
 */

'use strict';

const doFetchWithPolling = require('doFetchWithPolling');
const invariant = require('invariant');
const isPromise = require('isPromise');
const normalizePayload = require('normalizePayload');

import type {CacheConfig, Disposable} from 'RelayCombinedEnvironmentTypes';
import type {ConcreteBatch} from 'RelayConcreteNode';
import type {
  FetchFunction,
  Network,
  RelayResponsePayload,
  SubscribeFunction,
  PromiseOrValue,
  UploadableMap,
} from 'RelayNetworkTypes';
import type {Observer} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

/**
 * Creates an implementation of the `Network` interface defined in
 * `RelayNetworkTypes` given a single `fetch` function.
 */
function create(fetch: FetchFunction, subscribe?: SubscribeFunction): Network {
  function request(
    operation: ConcreteBatch,
    variables: Variables,
    cacheConfig?: ?CacheConfig,
    uploadables?: UploadableMap,
  ): PromiseOrValue<RelayResponsePayload> {
    const onSuccess = payload =>
      normalizePayload(operation, variables, payload);
    const response = fetch(operation, variables, cacheConfig, uploadables);
    if (isPromise(response)) {
      return response.then(onSuccess);
    } else if (response instanceof Error) {
      return response;
    } else {
      return onSuccess(response);
    }
  }

  function requestStream(
    operation: ConcreteBatch,
    variables: Variables,
    cacheConfig: ?CacheConfig,
    {onCompleted, onError, onNext}: Observer<RelayResponsePayload>,
  ): Disposable {
    if (operation.query.operation === 'subscription') {
      invariant(
        subscribe,
        'The default network layer does not support GraphQL Subscriptions. To use ' +
          'Subscriptions, provide a custom network layer.',
      );
      return subscribe(operation, variables, null, {
        onCompleted,
        onError,
        onNext: payload => {
          let relayPayload;
          try {
            relayPayload = normalizePayload(operation, variables, payload);
          } catch (err) {
            onError && onError(err);
            return;
          }
          onNext && onNext(relayPayload);
        },
      });
    }

    const pollInterval = cacheConfig && cacheConfig.poll;
    if (pollInterval != null) {
      return doFetchWithPolling(
        request,
        operation,
        variables,
        {onCompleted, onError, onNext},
        pollInterval,
      );
    }

    let isDisposed = false;
    const onRequestSuccess = payload => {
      if (isDisposed) {
        return;
      }
      let relayPayload;
      try {
        relayPayload = normalizePayload(operation, variables, payload);
      } catch (err) {
        onError && onError(err);
        return;
      }
      onNext && onNext(relayPayload);
      onCompleted && onCompleted();
    };

    const onRequestError = error => {
      if (isDisposed) {
        return;
      }
      onError && onError(error);
    };

    const requestResponse = fetch(operation, variables, cacheConfig);
    if (isPromise(requestResponse)) {
      requestResponse.then(onRequestSuccess, onRequestError).catch(rethrow);
    } else if (requestResponse instanceof Error) {
      onRequestError(requestResponse);
    } else {
      onRequestSuccess(requestResponse);
    }

    return {
      dispose() {
        isDisposed = true;
      },
    };
  }

  return {
    fetch,
    request,
    requestStream,
  };
}

function rethrow(err) {
  setTimeout(() => {
    throw err;
  }, 0);
}

module.exports = {create};
