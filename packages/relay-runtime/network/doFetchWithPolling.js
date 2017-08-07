/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule doFetchWithPolling
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');
const isPromise = require('isPromise');

import type {Disposable} from 'RelayCombinedEnvironmentTypes';
import type {ConcreteBatch} from 'RelayConcreteNode';
import type {
  RelayResponsePayload,
  RequestResponseFunction,
} from 'RelayNetworkTypes';
import type {Observer} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

function doFetchWithPolling(
  request: RequestResponseFunction,
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
    let requestResponse = request(operation, variables, {force: true});
    if (!isPromise(requestResponse)) {
      requestResponse =
        requestResponse instanceof Error
          ? Promise.reject(requestResponse)
          : Promise.resolve(requestResponse);
    }
    const onRequestSuccess = payload => {
      onNext && onNext(payload);
      timeout = setTimeout(poll, pollInterval);
    };
    const onRequestError = error => {
      dispose();
      onError && onError(error);
    };
    requestResponse
      .then(payload => {
        onRequestSuccess(payload);
      }, onRequestError)
      .catch(rethrow);
  }
  poll();

  return {dispose};
}

function rethrow(err) {
  setTimeout(() => {
    throw err;
  }, 0);
}

module.exports = doFetchWithPolling;
