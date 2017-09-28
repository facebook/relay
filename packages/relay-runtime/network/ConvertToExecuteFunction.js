/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ConvertToExecuteFunction
 * @flow
 * @format
 */

'use strict';

const RelayObservable = require('RelayObservable');

import type {
  ExecuteFunction,
  FetchFunction,
  SubscribeFunction,
} from 'RelayNetworkTypes';

/**
 * Converts a FetchFunction into an ExecuteFunction for use by RelayNetwork.
 */
function convertFetch(fn: FetchFunction): ExecuteFunction {
  return function fetch(operation, variables, cacheConfig, uploadables) {
    const result = fn(operation, variables, cacheConfig, uploadables);
    // Note: We allow FetchFunction to directly return Error to indicate
    // a failure to fetch. To avoid handling this special case throughout the
    // Relay codebase, it is explicitly handled here.
    if (result instanceof Error) {
      return new RelayObservable(sink => sink.error(result));
    }
    return RelayObservable.from(result);
  };
}

/**
 * Converts a SubscribeFunction into an ExecuteFunction for use by RelayNetwork.
 */
function convertSubscribe(fn: SubscribeFunction): ExecuteFunction {
  return function subscribe(operation, variables, cacheConfig) {
    return RelayObservable.fromLegacy(observer =>
      fn(operation, variables, cacheConfig, observer),
    );
  };
}

module.exports = {
  convertFetch,
  convertSubscribe,
};
