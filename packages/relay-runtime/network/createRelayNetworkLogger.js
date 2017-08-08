/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule createRelayNetworkLogger
 * @flow
 * @format
 */

'use strict';

/* eslint-disable no-console-disallow */

const isPromise = require('isPromise');
const prettyStringify = require('prettyStringify');

import type {CacheConfig, Disposable} from 'RelayCombinedEnvironmentTypes';
import type {ConcreteBatch} from 'RelayConcreteNode';
import type {IRelayNetworkLoggerTransaction} from 'RelayNetworkLoggerTransaction';
import type {
  FetchFunction,
  SubscribeFunction,
  QueryPayload,
  UploadableMap,
  PromiseOrValue,
} from 'RelayNetworkTypes';
import type {Observer} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

export type GraphiQLPrinter = (
  batch: ConcreteBatch,
  variables: Variables,
) => string;

function createRelayNetworkLogger(
  LoggerTransaction: Class<IRelayNetworkLoggerTransaction>,
): * {
  return {
    wrapFetch(
      fetch: FetchFunction,
      graphiQLPrinter?: GraphiQLPrinter,
    ): FetchFunction {
      return (
        operation: ConcreteBatch,
        variables: Variables,
        cacheConfig: ?CacheConfig,
        uploadables?: UploadableMap,
      ): PromiseOrValue<QueryPayload> => {
        const loggerTransaction = new LoggerTransaction({
          operation,
          variables,
          cacheConfig,
          uploadables,
        });

        console.time && console.time(loggerTransaction.getIdentifier());

        const onSettled = (error: ?Error, response: ?QueryPayload): void => {
          if (graphiQLPrinter) {
            loggerTransaction.addLog(
              'GraphiQL',
              graphiQLPrinter(operation, variables),
            );
          }
          loggerTransaction.addLog('Cache Config', cacheConfig);
          loggerTransaction.addLog('Variables', prettyStringify(variables));
          if (error) {
            loggerTransaction.addLog('Error', error);
          }
          if (response) {
            loggerTransaction.addLog('Response', response);
          }
          loggerTransaction.commitLogs(error, response);
        };

        const request = fetch(operation, variables, cacheConfig, uploadables);
        if (isPromise(request)) {
          request.then(
            response => {
              onSettled(null, response);
            },
            error => {
              onSettled(error, null);
            },
          );
        } else if (request instanceof Error) {
          onSettled(request, null);
        } else {
          onSettled(null, request);
        }
        return request;
      };
    },

    wrapSubscribe(
      subscribe: SubscribeFunction,
      graphiQLPrinter?: GraphiQLPrinter,
    ): SubscribeFunction {
      return (
        operation: ConcreteBatch,
        variables: Variables,
        cacheConfig: ?CacheConfig,
        {onCompleted, onNext, onError}: Observer<QueryPayload>,
      ): Disposable => {
        const onResponse = (
          error: ?Error,
          response: ?QueryPayload,
          status: ?string,
        ): void => {
          const loggerTransaction = new LoggerTransaction({
            operation,
            variables,
            cacheConfig,
          });
          if (graphiQLPrinter) {
            loggerTransaction.addLog(
              'GraphiQL',
              graphiQLPrinter(operation, variables),
            );
          }
          loggerTransaction.addLog('Cache Config', cacheConfig);
          loggerTransaction.addLog('Variables', prettyStringify(variables));
          if (status) {
            loggerTransaction.addLog('Status', status);
          }
          if (error) {
            loggerTransaction.addLog('Error', error);
          }
          if (response) {
            loggerTransaction.addLog('Response', response);
          }
          loggerTransaction.commitLogs(error, response, status);
        };

        const subscription = subscribe(operation, variables, cacheConfig, {
          onCompleted: () => {
            onCompleted && onCompleted();
            onResponse(null, null, 'subscription is unsubscribed.');
          },
          onNext: (payload: QueryPayload) => {
            onNext && onNext(payload);
            onResponse(null, payload, 'subscription receives update');
          },
          onError: (error: Error) => {
            onError && onError(error);
            onResponse(error, null);
          },
        });
        onResponse(null, null, 'subscription is sent');
        return subscription;
      };
    },
  };
}

module.exports = createRelayNetworkLogger;
