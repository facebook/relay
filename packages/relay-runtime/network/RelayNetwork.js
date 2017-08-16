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
const isPromise = require('isPromise');
const normalizePayload = require('normalizePayload');
const nullthrows = require('nullthrows');

import type {CacheConfig, Disposable} from 'RelayCombinedEnvironmentTypes';
import type {ConcreteBatch} from 'RelayConcreteNode';
import type {
  FetchFunction,
  Network,
  RelayResponsePayload,
  SubscribeFunction,
  PromiseOrValue,
  QueryPayload,
  UploadableMap,
} from 'RelayNetworkTypes';
import type {ObservableOrPromiseOrValue} from 'RelayObservable';
import type {Observer} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

/**
 * Creates an implementation of the `Network` interface defined in
 * `RelayNetworkTypes` given a single `fetch` function.
 */
function create(fetch: FetchFunction, subscribe?: SubscribeFunction): Network {
  function observe(
    operation: ConcreteBatch,
    variables: Variables,
    cacheConfig?: ?CacheConfig,
    uploadables?: ?UploadableMap,
  ): RelayObservable<QueryPayload> {
    return observeStream(
      fetch,
      subscribe,
      operation,
      variables,
      cacheConfig,
      uploadables,
    );
  }

  function request(
    operation: ConcreteBatch,
    variables: Variables,
    cacheConfig?: ?CacheConfig,
    uploadables?: ?UploadableMap,
  ): PromiseOrValue<RelayResponsePayload> {
    return observeFetch(fetch, operation, variables, cacheConfig, uploadables)
      .map(payload => normalizePayload(operation, variables, payload))
      .toPromise()
      .then(nullthrows);
  }

  function requestStream(
    operation: ConcreteBatch,
    variables: Variables,
    cacheConfig: ?CacheConfig,
    observer: Observer<RelayResponsePayload>,
  ): Disposable {
    return observeStream(fetch, subscribe, operation, variables, cacheConfig)
      .map(payload => normalizePayload(operation, variables, payload))
      .subscribeLegacy(observer);
  }

  return {
    observe,
    fetch,
    request,
    requestStream,
  };
}

function observeFetch(
  fetch: FetchFunction,
  operation: ConcreteBatch,
  variables: Variables,
  cacheConfig?: ?CacheConfig,
  uploadables?: ?UploadableMap,
): RelayObservable<QueryPayload> {
  const result: ObservableOrPromiseOrValue<QueryPayload> = fetch(
    operation,
    variables,
    cacheConfig,
    uploadables,
  );
  return RelayObservable.from(result);
}

function observeStream(
  fetch: FetchFunction,
  subscribe: ?SubscribeFunction,
  operation: ConcreteBatch,
  variables: Variables,
  cacheConfig: ?CacheConfig,
  uploadables: ?UploadableMap,
): RelayObservable<QueryPayload> {
  const subscribe_ = subscribe; // Tell Flow this function arg is const.
  if (operation.query.operation === 'subscription') {
    invariant(
      subscribe_,
      'The default network layer does not support GraphQL Subscriptions. ' +
        'To use Subscriptions, provide a custom network layer.',
    );

    invariant(!uploadables, 'Cannot provide uploadables while subscribing.');

    return RelayObservable.fromLegacy(observer =>
      subscribe_(operation, variables, null, observer),
    );
  }

  const pollInterval = cacheConfig && cacheConfig.poll;
  if (pollInterval != null) {
    invariant(!uploadables, 'Cannot provide uploadables while polling.');
    return observeFetch(fetch, operation, variables, {force: true}).poll(
      pollInterval,
    );
  }

  return observeFetch(fetch, operation, variables, cacheConfig, uploadables);
}

module.exports = {create};
