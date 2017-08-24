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

const RelayObservable = require('RelayObservable');

const invariant = require('invariant');

const {convertFetch, convertSubscribe} = require('ConvertToObserveFunction');

import type {CacheConfig} from 'RelayCombinedEnvironmentTypes';
import type {ConcreteBatch} from 'RelayConcreteNode';
import type {
  FetchFunction,
  Network,
  QueryPayload,
  SubscribeFunction,
  UploadableMap,
} from 'RelayNetworkTypes';
import type {Observer} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

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

  function observe(
    operation: ConcreteBatch,
    variables: Variables,
    cacheConfig: CacheConfig,
    uploadables?: ?UploadableMap,
  ): RelayObservable<QueryPayload> {
    if (operation.query.operation === 'subscription') {
      invariant(
        observeSubscribe,
        'RelayNetwork: This network layer does not support Subscriptions. ' +
          'To use Subscriptions, provide a custom network layer.',
      );

      invariant(
        !uploadables,
        'RelayNetwork: Cannot provide uploadables while subscribing.',
      );
      return observeSubscribe(operation, variables, cacheConfig);
    }

    const pollInterval = cacheConfig.poll;
    if (pollInterval != null) {
      invariant(
        !uploadables,
        'RelayNetwork: Cannot provide uploadables while polling.',
      );
      return observeFetch(operation, variables, {force: true}).poll(
        pollInterval,
      );
    }

    return observeFetch(operation, variables, cacheConfig, uploadables);
  }

  return {observe};
}

module.exports = {create};
