/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const {convertFetch} = require('./ConvertToExecuteFunction');

import type {RequestParameters} from '../util/RelayConcreteNode';
import type {Variables} from '../util/RelayRuntimeTypes';
import type {IRelayNetworkLoggerTransaction} from './RelayNetworkLoggerTransaction';
import type {
  ExecuteFunction,
  FetchFunction,
  SubscribeFunction,
} from './RelayNetworkTypes';

export type GraphiQLPrinter = (
  request: RequestParameters,
  variables: Variables,
) => string;

export type NetworkLogger = {|
  wrapFetch: (
    fetch: FetchFunction,
    graphiQLPrinter?: GraphiQLPrinter,
  ) => FetchFunction,
  wrapSubscribe: (
    subscribe: SubscribeFunction,
    graphiQLPrinter?: GraphiQLPrinter,
  ) => SubscribeFunction,
|};

function createRelayNetworkLogger(
  LoggerTransaction: Class<IRelayNetworkLoggerTransaction>,
): NetworkLogger {
  return {
    wrapFetch(
      fetch: FetchFunction,
      graphiQLPrinter?: GraphiQLPrinter,
    ): FetchFunction {
      return (request, variables, cacheConfig, uploadables) => {
        const wrapped = wrapExecute(
          convertFetch(fetch),
          LoggerTransaction,
          graphiQLPrinter,
        );
        return wrapped(request, variables, cacheConfig, uploadables);
      };
    },

    wrapSubscribe(
      subscribe: SubscribeFunction,
      graphiQLPrinter?: GraphiQLPrinter,
    ): SubscribeFunction {
      return (request, variables, cacheConfig) => {
        const wrapped = wrapExecute(
          subscribe,
          LoggerTransaction,
          graphiQLPrinter,
        );
        return wrapped(request, variables, cacheConfig);
      };
    },
  };
}

function wrapExecute(
  execute: ExecuteFunction,
  LoggerTransaction: Class<IRelayNetworkLoggerTransaction>,
  graphiQLPrinter: ?GraphiQLPrinter,
): ExecuteFunction {
  return (request, variables, cacheConfig, uploadables) => {
    let transaction;

    function addLogs(error, response, status) {
      // Only print GraphiQL links for non-batch requests.
      if (graphiQLPrinter) {
        transaction.addLog('GraphiQL', graphiQLPrinter(request, variables));
      }
      transaction.addLog('Cache Config', cacheConfig);
      transaction.addLog('Variables', JSON.stringify(variables, null, 2));
      if (status) {
        transaction.addLog('Status', status);
      }
      if (error) {
        transaction.addLog('Error', error);
      }
      if (response) {
        transaction.addLog('Response', response);
      }
    }

    function flushLogs(error, response, status) {
      addLogs(error, response, status);
      transaction.flushLogs(error, response, status);
    }

    function commitLogs(error, response, status) {
      addLogs(error, response, status);
      transaction.commitLogs(error, response, status);
    }

    const observable = execute(request, variables, cacheConfig, uploadables);

    const isSubscription = request.operationKind === 'subscription';

    return observable.do({
      start: () => {
        transaction = new LoggerTransaction({
          request,
          variables,
          cacheConfig,
          uploadables,
        });
        transaction.timerStart();
        if (isSubscription) {
          flushLogs(null, null, 'subscription is sent.');
        }
      },
      next: payload => {
        flushLogs(null, payload);
        transaction.timerStart();
      },
      error: error => commitLogs(error, null, null),
      complete: () => {
        if (isSubscription) {
          commitLogs(null, null, 'subscription was closed.');
        } else {
          // the last `next` already flushed the logs, just mark as committed
          // without spamming the logs
          transaction.markCommitted();
        }
      },
      unsubscribe: () =>
        commitLogs(
          null,
          null,
          isSubscription
            ? 'subscription is unsubscribed.'
            : 'execution is unsubscribed.',
        ),
    });
  };
}

module.exports = createRelayNetworkLogger;
