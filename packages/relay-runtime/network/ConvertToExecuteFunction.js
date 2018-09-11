/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const RelayConcreteNode = require('../util/RelayConcreteNode');
const RelayObservable = require('./RelayObservable');

const warning = require('warning');

import type {RequestNode} from '../util/RelayConcreteNode';
import type {Variables} from '../util/RelayRuntimeTypes';
import type {
  ExecuteFunction,
  ExecutePayload,
  FetchFunction,
  GraphQLResponse,
  StreamFunction,
  StreamPayload,
  SubscribeFunction,
} from './RelayNetworkTypes';

function filterDataFromStream(
  observable: RelayObservable<StreamPayload>,
): RelayObservable<ExecutePayload> {
  return RelayObservable.create(sink => {
    return observable.subscribe({
      next(value) {
        if (value.kind === 'data') {
          sink.next(value);
        }
      },
      error: sink.error,
      complete: sink.complete,
    });
  });
}

/**
 * Converts a FetchFunction into an ExecuteFunction for use by RelayNetwork.
 */
function convertFetch(fn: FetchFunction): ExecuteFunction {
  return function fetch(request, variables, cacheConfig, uploadables) {
    const result = fn(request, variables, cacheConfig, uploadables);
    // Note: We allow FetchFunction to directly return Error to indicate
    // a failure to fetch. To avoid handling this special case throughout the
    // Relay codebase, it is explicitly handled here.
    if (result instanceof Error) {
      return filterDataFromStream(
        RelayObservable.create(sink => sink.error(result)),
      );
    }
    const withEvents = RelayObservable.from(result).map(value => {
      return convertToStreamPayload(request, variables, value);
    });
    return filterDataFromStream(withEvents);
  };
}

/**
 * Converts a SubscribeFunction into an ExecuteFunction for use by RelayNetwork.
 */
function convertSubscribe(fn: SubscribeFunction): ExecuteFunction {
  return function subscribe(operation, variables, cacheConfig) {
    const withEvents = RelayObservable.fromLegacy(observer =>
      fn(operation, variables, cacheConfig, observer),
    ).map(value => convertToStreamPayload(operation, variables, value));
    return filterDataFromStream(withEvents);
  };
}

function convertSubscribeWithEvents(fn: SubscribeFunction): StreamFunction {
  return function subscribe(operation, variables, cacheConfig) {
    return RelayObservable.fromLegacy(observer =>
      fn(operation, variables, cacheConfig, observer),
    ).map(value => convertToStreamPayload(operation, variables, value));
  };
}

/**
 * Given a value which might be a plain GraphQLResponse, coerce to always return
 * an ExecutePayload. A GraphQLResponse may be returned directly from older or
 * simpler Relay Network implementations.
 */
function convertToStreamPayload(
  request: RequestNode,
  variables: Variables,
  value: GraphQLResponse | StreamPayload,
): StreamPayload {
  if (!value.data && !value.errors && value.response) {
    if (!value.operation) {
      warning(
        false,
        'ConvertToExecuteFunction: execute payload contains response but ' +
          'is missing operation.',
      );
      return createExecutePayload(request, variables, value.response);
    }
    // assume value is data if value.response defined, but no kind field given
    return {...value, kind: 'data'};
  } else if (!value.data && !value.errors && value.kind === 'event') {
    return value;
  } else {
    // in this case we have a GraphQLResponse
    return createExecutePayload(request, variables, value);
  }
}

function createExecutePayload(request, variables, response) {
  if (request.kind === RelayConcreteNode.BATCH_REQUEST) {
    throw new Error(
      'ConvertToExecuteFunction: Batch request must return ExecutePayload.',
    );
  }
  return {kind: 'data', operation: request.operation, variables, response};
}

module.exports = {
  convertFetch,
  convertSubscribe,
  convertSubscribeWithEvents,
};
