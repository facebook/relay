/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const generateID = require('../util/generateID');

import type {LogFunction} from '../store/RelayStoreTypes';
import type {RequestParameters} from '../util/RelayConcreteNode';
import type {CacheConfig, Variables} from '../util/RelayRuntimeTypes';
import type {
  INetwork,
  GraphQLResponse,
  UploadableMap,
} from './RelayNetworkTypes';
import type RelayObservable from './RelayObservable';

/**
 * Wraps the network with logging to ensure that network requests are
 * always logged. Relying on each network callsite to be wrapped is
 * untenable and will eventually lead to holes in the logging.
 */
function wrapNetworkWithLogObserver(
  log: LogFunction,
  network: INetwork,
): INetwork {
  return {
    execute(
      params: RequestParameters,
      variables: Variables,
      cacheConfig: CacheConfig,
      uploadables?: ?UploadableMap,
    ): RelayObservable<GraphQLResponse> {
      const networkRequestId = generateID();
      const logObserver = {
        start: subscription => {
          log({
            name: 'network.start',
            networkRequestId,
            params,
            variables,
            cacheConfig,
          });
        },
        next: response => {
          log({
            name: 'network.next',
            networkRequestId,
            response,
          });
        },
        error: error => {
          log({
            name: 'network.error',
            networkRequestId,
            error,
          });
        },
        complete: () => {
          log({
            name: 'network.complete',
            networkRequestId,
          });
        },
        unsubscribe: () => {
          log({
            name: 'network.unsubscribe',
            networkRequestId,
          });
        },
      };
      const logRequestInfo = info => {
        log({
          name: 'network.info',
          networkRequestId,
          info,
        });
      };
      return network
        .execute(params, variables, cacheConfig, uploadables, logRequestInfo)
        .do(logObserver);
    },
  };
}

module.exports = wrapNetworkWithLogObserver;
