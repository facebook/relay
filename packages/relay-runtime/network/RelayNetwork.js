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

const RelayError = require('RelayError');

const emptyFunction = require('emptyFunction');
const invariant = require('invariant');
const normalizeRelayPayload = require('normalizeRelayPayload');

const {ROOT_ID} = require('RelayStoreUtils');

import type {CacheConfig, Disposable} from 'RelayCombinedEnvironmentTypes';
import type {ConcreteBatch} from 'RelayConcreteNode';
import type {
  FetchFunction,
  Network,
  QueryPayload,
  RelayResponsePayload,
  SubscribeFunction,
  UploadableMap,
} from 'RelayNetworkTypes';
import type {Observer, SingleObserver} from 'RelayStoreTypes';
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
    observer: SingleObserver<RelayResponsePayload>,
  ): Disposable {
    let isDisposed = false;
    const onCompleted = payload => {
      if (isDisposed) {
        return;
      }
      let relayPayload;
      try {
        relayPayload = normalizePayload(operation, variables, payload);
      } catch (err) {
        observer.onError(err);
        return;
      }
      observer.onCompleted(relayPayload);
    };
    const onError = error => {
      if (isDisposed) {
        return;
      }
      observer.onError(error);
    };
    const response = fetch(operation, variables, cacheConfig, uploadables);
    invariant(
      typeof response === 'object' && response !== null,
      'RelayNetwork: Expected fetch function to return an object, got `%s`.',
      response,
    );
    if (typeof response.then === 'function') {
      response.then(onCompleted).catch(onError);
    } else {
      onCompleted((response: any));
    }
    return {
      dispose() {
        isDisposed = true;
      },
    };
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

    return request(operation, variables, cacheConfig, null, {
      onCompleted: payload => {
        onNext && onNext(payload);
        onCompleted && onCompleted();
      },
      onError: error => {
        onError && onError(error);
      },
    });
  }

  return {
    fetch,
    request,
    requestStream,
  };
}

function doFetchWithPolling(
  request,
  operation: ConcreteBatch,
  variables: Variables,
  {onCompleted, onError, onNext}: Observer<RelayResponsePayload>,
  pollInterval: number,
): Disposable {
  invariant(
    pollInterval > 0,
    'RelayNetwork: Expected pollInterval to be positive, got `%s`.',
    pollInterval,
  );
  let requestResponse = null;
  let timeout = null;
  const dispose = () => {
    if (requestResponse != null) {
      requestResponse.dispose();
      requestResponse = null;
    }
    if (timeout != null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  function poll() {
    requestResponse = request(
      operation,
      variables,
      {force: true},
      {
        onCompleted: payload => {
          onNext && onNext(payload);
          timeout = setTimeout(poll, pollInterval);
        },
        onError: error => {
          dispose();
          onError && onError(error);
        },
      },
    );
  }
  poll();

  return {dispose};
}

function normalizePayload(
  operation: ConcreteBatch,
  variables: Variables,
  payload: QueryPayload,
): RelayResponsePayload {
  const {data, errors} = payload;
  if (data != null) {
    return normalizeRelayPayload(
      {
        dataID: ROOT_ID,
        node: operation.query,
        variables,
      },
      data,
      errors,
      {handleStrippedNulls: true},
    );
  }
  const error = RelayError.create(
    'RelayNetwork',
    'No data returned for operation `%s`, got error(s):\n%s\n\nSee the error ' +
      '`source` property for more information.',
    operation.name,
    errors ? errors.map(({message}) => message).join('\n') : '(No errors)',
  );
  (error: any).source = {errors, operation, variables};
  throw error;
}

function rethrow(err) {
  setTimeout(() => {
    throw err;
  }, 0);
}

module.exports = {create};
