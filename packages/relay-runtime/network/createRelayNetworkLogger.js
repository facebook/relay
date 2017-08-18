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
const nullthrows = require('nullthrows');
const prettyStringify = require('prettyStringify');

const {convertFetch, convertSubscribe} = require('ConvertToObserveFunction');

import type {CacheConfig, Disposable} from 'RelayCombinedEnvironmentTypes';
import type {ConcreteBatch} from 'RelayConcreteNode';
import type {IRelayNetworkLoggerTransaction} from 'RelayNetworkLoggerTransaction';
import type {
  FetchFunction,
  ObserveFunction,
  QueryPayload,
  SubscribeFunction,
  UploadableMap,
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
      return (operation, variables, cacheConfig, uploadables) => {
        const wrapped = wrapObserve(
          convertFetch(fetch),
          LoggerTransaction,
          graphiQLPrinter,
        );
        return wrapped(operation, variables, cacheConfig, uploadables)
          .toPromise()
          .then(nullthrows);
      };
    },

    wrapSubscribe(
      subscribe: SubscribeFunction,
      graphiQLPrinter?: GraphiQLPrinter,
    ): SubscribeFunction {
      return (operation, variables, cacheConfig, observer) => {
        const wrapped = wrapObserve(
          convertSubscribe(subscribe),
          LoggerTransaction,
          graphiQLPrinter,
        );
        return wrapped(operation, variables, cacheConfig).subscribeLegacy(
          observer,
        );
      };
    },
  };
}

function wrapObserve(
  observe: ObserveFunction,
  LoggerTransaction: Class<IRelayNetworkLoggerTransaction>,
  graphiQLPrinter: ?GraphiQLPrinter,
): ObserveFunction {
  return (operation, variables, cacheConfig, uploadables) => {
    function createTransaction() {
      return new LoggerTransaction({
        operation,
        variables,
        cacheConfig,
        uploadables,
      });
    }

    function log(loggerTransaction, error, response, status) {
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
    }

    const observable = observe(operation, variables, cacheConfig, uploadables);

    // Create a new transaction for every event for subscriptions.
    if (operation.query.operation === 'subscription') {
      return observable.do({
        start: () =>
          log(createTransaction(), null, null, 'subscription is sent'),
        next: payload =>
          log(
            createTransaction(),
            null,
            payload,
            'subscription receives update',
          ),
        error: error => log(createTransaction(), error, null),
        complete: () =>
          log(createTransaction(), null, null, 'subscription was closed.'),
        unsubscribe: () =>
          log(createTransaction(), null, null, 'subscription is unsubscribed.'),
      });
    } else {
      const transaction = createTransaction();
      return observable.do({
        start: () => {
          console.time && console.time(transaction.getIdentifier());
        },
        next: payload => log(transaction, null, payload),
        error: error => log(transaction, error, null),
      });
    }
  };
}

module.exports = createRelayNetworkLogger;
