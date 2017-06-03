/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayNetworkLogger
 * @flow
 * @format
 */

'use strict';

/* eslint-disable no-console-disallow */

const prettyStringify = require('prettyStringify');

import type {CacheConfig, Disposable} from 'RelayCombinedEnvironmentTypes';
import type {ConcreteBatch} from 'RelayConcreteNode';
import type {
  FetchFunction,
  SubscribeFunction,
  QueryPayload,
  UploadableMap,
  SyncOrPromise,
} from 'RelayNetworkTypes';
import type {Observer} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

export type GraphiQLPrinter = (
  batch: ConcreteBatch,
  variables: Variables,
) => string;

let queryID = 1;

const RelayNetworkLogger = {
  wrapFetch(
    fetch: FetchFunction,
    graphiQLPrinter?: GraphiQLPrinter,
  ): FetchFunction {
    return (
      operation: ConcreteBatch,
      variables: Variables,
      cacheConfig: ?CacheConfig,
      uploadables?: UploadableMap,
    ): SyncOrPromise<QueryPayload> => {
      const id = queryID++;
      const name = operation.name;

      const idName = `[${id}] Relay Modern: ${name}`;

      console.time && console.time(idName);

      const onSettled = (error: ?Error, response: ?QueryPayload): void => {
        console.groupCollapsed(`%c${idName}`, error ? 'color:red' : '');
        console.timeEnd && console.timeEnd(idName);
        if (graphiQLPrinter) {
          console.log('GraphiQL:', graphiQLPrinter(operation, variables));
        }
        console.log('Cache Config:', cacheConfig);
        console.log('Variables:', prettyStringify(variables));
        if (error) {
          console.log('Error:', error);
        }
        if (response) {
          console.log('Response:', response);
        }
        console.groupEnd();
      };

      const request = fetch(operation, variables, cacheConfig, uploadables);
      switch (request.kind) {
        case 'data':
          onSettled(null, request.data);
          break;
        case 'error':
          onSettled(request.error, null);
          break;
        case 'promise':
          request.promise.then(
            response => {
              onSettled(null, response);
            },
            error => {
              onSettled(error, null);
            },
          );
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
      const id = queryID++;
      const name = operation.name;

      const idName = `[${id}] Relay Modern: ${name}`;

      const onResponse = (
        error: ?Error,
        response: ?QueryPayload,
        status: ?string,
      ): void => {
        console.groupCollapsed(`%c${idName}`, error ? 'color:red' : '');
        if (graphiQLPrinter) {
          console.log('GraphiQL:', graphiQLPrinter(operation, variables));
        }
        console.log('Cache Config:', cacheConfig);
        console.log('Variables:', prettyStringify(variables));
        if (status) {
          console.log('Status:', status);
        }
        if (error) {
          console.log('Error:', error);
        }
        if (response) {
          console.log('Response:', response);
        }
        console.groupEnd();
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

module.exports = RelayNetworkLogger;
