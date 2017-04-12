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
 */

'use strict';

const RelayError = require('RelayError');

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
import type {Observer} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

/**
 * Creates an implementation of the `Network` interface defined in
 * `RelayNetworkTypes` given a single `fetch` function.
 */
function create(
  fetch: FetchFunction,
  subscribe?: SubscribeFunction,
): Network {
  function request(
    operation: ConcreteBatch,
    variables: Variables,
    cacheConfig?: ?CacheConfig,
    uploadables?: UploadableMap,
  ): Promise<RelayResponsePayload> {
    return fetch(operation, variables, cacheConfig, uploadables).then(
      payload => normalizePayload(operation, variables, payload)
    );
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
    fetch(operation, variables, cacheConfig)
      .then(
        payload => {
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
        },
        error => {
          if (isDisposed) {
            return;
          }
          onError && onError(error);
        },
      )
      .catch(rethrow);
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
  let isDisposed = false;
  let timeout = null;
  const dispose = () => {
    if (!isDisposed) {
      isDisposed = true;
      timeout && clearTimeout(timeout);
    }
  };
  function poll() {
    request(operation, variables, {force: true}).then(
      payload => {
        onNext && onNext(payload);
        timeout = setTimeout(poll, pollInterval);
      },
      error => {
        dispose();
        onError && onError(error);
      }
    );
  }
  timeout = setTimeout(poll, pollInterval);

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
  setTimeout(
    () => {
      throw err;
    },
    0,
  );
}

module.exports = {create};
