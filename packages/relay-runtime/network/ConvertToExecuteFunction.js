/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import type {ExecuteFunction, FetchFunction} from './RelayNetworkTypes';

const RelayObservable = require('./RelayObservable');

/**
 * Converts a FetchFunction into an ExecuteFunction for use by RelayNetwork.
 */
function convertFetch(fn: FetchFunction): ExecuteFunction {
  return function fetch(
    request,
    variables,
    cacheConfig,
    uploadables,
    logRequestInfo,
  ) {
    const result = fn(
      request,
      variables,
      cacheConfig,
      uploadables,
      logRequestInfo,
    );
    // Note: We allow FetchFunction to directly return Error to indicate
    // a failure to fetch. To avoid handling this special case throughout the
    // Relay codebase, it is explicitly handled here.
    // $FlowFixMe[incompatible-type]
    if (result instanceof Error) {
      return RelayObservable.create(sink => sink.error(result));
    }
    return RelayObservable.from(result);
  };
}

module.exports = {
  convertFetch,
};
