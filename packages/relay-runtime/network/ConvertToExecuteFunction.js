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
  SubscribeFunction,
} from './RelayNetworkTypes';

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
      return RelayObservable.create(sink => sink.error(result));
    }
    return RelayObservable.from(result).map(value =>
      convertToExecutePayload(request, variables, value),
    );
  };
}

/**
 * Converts a SubscribeFunction into an ExecuteFunction for use by RelayNetwork.
 */
function convertSubscribe(fn: SubscribeFunction): ExecuteFunction {
  return function subscribe(operation, variables, cacheConfig) {
    return RelayObservable.fromLegacy(observer =>
      fn(operation, variables, cacheConfig, observer),
    ).map(value => convertToExecutePayload(operation, variables, value));
  };
}

/**
 * Given a value which might be a plain GraphQLResponse, coerce to always return
 * an ExecutePayload. A GraphQLResponse may be returned directly from older or
 * simpler Relay Network implementations.
 */
function convertToExecutePayload(
  request: RequestNode,
  variables: Variables,
  value: GraphQLResponse | ExecutePayload,
): ExecutePayload {
  if (!value.data && !value.errors && value.response) {
    if (!value.operation) {
      warning(
        false,
        'ConvertToExecuteFunction: execute payload contains response but ' +
          'is missing operation.',
      );
      return createExecutePayload(request, variables, value.response);
    }
    return value;
  }
  return createExecutePayload(request, variables, value);
}

function createExecutePayload(request, variables, response) {
  if (request.kind === RelayConcreteNode.BATCH_REQUEST) {
    throw new Error(
      'ConvertToExecuteFunction: Batch request must return ExecutePayload.',
    );
  }
  return {operation: request.operation, variables, response};
}

module.exports = {
  convertFetch,
  convertSubscribe,
};
