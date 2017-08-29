/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ConvertToObserveFunction
 * @flow
 * @format
 */

'use strict';

const RelayObservable = require('RelayObservable');

import type {
  FetchFunction,
  ObserveFunction,
  SubscribeFunction,
} from 'RelayNetworkTypes';

/**
 * Converts a FetchFunction into an ObserveFunction for use by RelayNetwork.
 */
function convertFetch(fn: FetchFunction): ObserveFunction {
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
 * Converts a SubscribeFunction into an ObserveFunction for use by RelayNetwork.
 */
function convertSubscribe(fn: SubscribeFunction): ObserveFunction {
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
