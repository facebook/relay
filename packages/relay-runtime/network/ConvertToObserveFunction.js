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
    return RelayObservable.from(
      fn(operation, variables, cacheConfig, uploadables),
    );
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
