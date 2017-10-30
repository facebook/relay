/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule createRelayNetworkLogger
 * @flow
 * @format
 */

'use strict';

const RelayConcreteNode = require('RelayConcreteNode');

const prettyStringify = require('prettyStringify');

const {convertFetch, convertSubscribe} = require('ConvertToExecuteFunction');

import type {ConcreteRequest} from 'RelayConcreteNode';
import type {IRelayNetworkLoggerTransaction} from 'RelayNetworkLoggerTransaction';
import type {
  ExecuteFunction,
  FetchFunction,
  SubscribeFunction,
} from 'RelayNetworkTypes';
import type {Variables} from 'react-relay/classic/tools/RelayTypes';

export type GraphiQLPrinter = (
  request: ConcreteRequest,
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
          convertSubscribe(subscribe),
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
  return (_request, variables, cacheConfig, uploadables) => {
    // Const for flow refinement.
    const request = _request;
    if (request.kind === RelayConcreteNode.BATCH_REQUEST) {
      throw new Error(
        'createRelayNetworkLogger: Batch request not yet ' +
          'implemented (T22955154)',
      );
    }
    let transaction;

    function addLogs(error, response, status) {
      if (graphiQLPrinter) {
        transaction.addLog('GraphiQL', graphiQLPrinter(request, variables));
      }
      transaction.addLog('Cache Config', cacheConfig);
      transaction.addLog('Variables', prettyStringify(variables));
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
        console.time && console.time(transaction.getIdentifier());
        if (isSubscription) {
          flushLogs(null, null, 'subscription is sent.');
        }
      },
      next: payload => {
        flushLogs(null, payload);
        console.time && console.time(transaction.getIdentifier());
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
