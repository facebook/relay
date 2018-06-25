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

const RelayObservable = require('./RelayObservable');

const invariant = require('invariant');

const {convertFetch, convertSubscribe} = require('./ConvertToExecuteFunction');

import type {RequestNode} from '../util/RelayConcreteNode';
import type {CacheConfig, Variables} from '../util/RelayRuntimeTypes';
import type {
  FetchFunction,
  Network,
  ExecutePayload,
  SubscribeFunction,
  UploadableMap,
} from './RelayNetworkTypes';

/**
 * Creates an implementation of the `Network` interface defined in
 * `RelayNetworkTypes` given `fetch` and `subscribe` functions.
 */
function create(
  fetchFn: FetchFunction,
  subscribeFn?: SubscribeFunction,
): Network {
  // Convert to functions that returns RelayObservable.
  const observeFetch = convertFetch(fetchFn);
  const observeSubscribe = subscribeFn
    ? convertSubscribe(subscribeFn)
    : undefined;

  function execute(
    request: RequestNode,
    variables: Variables,
    cacheConfig: CacheConfig,
    uploadables?: ?UploadableMap,
  ): RelayObservable<ExecutePayload> {
    if (request.operationKind === 'subscription') {
      invariant(
        observeSubscribe,
        'RelayNetwork: This network layer does not support Subscriptions. ' +
          'To use Subscriptions, provide a custom network layer.',
      );

      invariant(
        !uploadables,
        'RelayNetwork: Cannot provide uploadables while subscribing.',
      );
      return observeSubscribe(request, variables, cacheConfig);
    }

    const pollInterval = cacheConfig.poll;
    if (pollInterval != null) {
      invariant(
        !uploadables,
        'RelayNetwork: Cannot provide uploadables while polling.',
      );
      return observeFetch(request, variables, {force: true}).poll(pollInterval);
    }

    return observeFetch(request, variables, cacheConfig, uploadables);
  }

  return {execute};
}

module.exports = {create};
