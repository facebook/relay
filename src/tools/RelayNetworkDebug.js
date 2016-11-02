/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayNetworkDebug
 * @flow
 */

'use strict';

const Relay = require('RelayPublic');

const performanceNow = require('performanceNow');
const xhrSimpleDataSerializer = require('xhrSimpleDataSerializer');

import type RelayEnvironment from 'RelayEnvironment';
import type RelayMutationRequest from 'RelayMutationRequest';
import type RelayQueryRequest from 'RelayQueryRequest';
import type {ChangeSubscription} from 'RelayTypes';

export type RelayNetworkDebuggable = {
  name: string,
  type: string,
  promise: Promise<any>,
  logResult: (error: ?Object, response: ?Object) => void,
};

class RelayNetworkDebugger {
  _initTime: number;
  _queryID: number;
  _subscription: ChangeSubscription;

  constructor(
    environment: RelayEnvironment,
    graphiqlPrinter: ?((request: RelayQueryRequest | RelayMutationRequest) => string),
  ) {
    this._initTime = performanceNow();
    this._queryID = 0;
    this._subscription = environment.addNetworkSubscriber(
      request => this.logRequest(
        createDebuggableFromRequest('Relay Query', request, graphiqlPrinter)
      ),
      request => this.logRequest(
        createDebuggableFromRequest('Relay Mutation', request, graphiqlPrinter)
      ),
    );
  }

  uninstall(): void {
    this._subscription.remove();
  }

  logRequest({name, type, promise, logResult}: RelayNetworkDebuggable): void {
    const id = this._queryID++;
    const timerName = `[${id}] Request Duration`;

    console.timeStamp && console.timeStamp(
      `START: [${id}] ${type}: ${name} \u2192`
    );
    console.time && console.time(timerName);

    const onSettled = (error, response) => {
      const time = (performanceNow() - this._initTime) / 1000;
      console.timeStamp && console.timeStamp(
        `\u2190 END: [${id}] ${type}: ${name}`
      );
      const groupName = `%c[${id}] ${type}: ${name} @ ${time}s`;
      console.groupCollapsed(groupName, `color:${error ? 'red' : 'black'};`);
      console.timeEnd && console.timeEnd(timerName);
      logResult(error, response);
      console.groupEnd();
    };

    promise.then(
      response => onSettled(null, response),
      error => onSettled(error, null),
    );
  }
}

function createDebuggableFromRequest(
  type: string,
  request: RelayQueryRequest | RelayMutationRequest,
  graphiqlPrinter: ?((request: RelayQueryRequest | RelayMutationRequest) => string),
): RelayNetworkDebuggable {
  return {
    name: request.getDebugName(),
    type,
    promise: request.getPromise(),
    logResult(error, response) {
      /* eslint-disable no-console-disallow */
      const requestSize = formatSize(
        xhrSimpleDataSerializer({
          q: request.getQueryString(),
          query_params: request.getVariables(),
        }).length
      );
      const requestVariables = request.getVariables();

      console.groupCollapsed(
        'Request Query (Estimated Size: %s)',
        requestSize
      );

      if (graphiqlPrinter) {
        console.groupCollapsed('GraphiQL Link');
        console.debug(graphiqlPrinter(request));
        console.groupEnd();
      }

      console.groupCollapsed('Query Text');
      console.debug(
        '%c%s\n',
        'font-size:10px; color:#333; font-family:mplus-2m-regular,menlo,' +
        'monospaced;',
        request.getQueryString()
      );
      console.groupEnd();

      console.groupEnd();

      if (Object.keys(requestVariables).length > 0) {
        console.log('Request Variables\n', request.getVariables());
      }

      error && console.error(error);
      response && console.log(response);
      /* eslint-enable no-console-disallow */
    },
  };
}

const ALL_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
function formatSize(bytes: number): string {
  const sign = bytes < 0 ? -1 : 1;
  bytes = Math.abs(bytes);
  let i = 0;
  while (bytes >= Math.pow(1024, i + 1) && i < ALL_UNITS.length) {
    i++;
  }
  const value = sign * bytes * 1.0 / Math.pow(1024, i);
  return Number(value.toFixed(2)) + ALL_UNITS[i];
}

let networkDebugger: ?RelayNetworkDebugger;

const RelayNetworkDebug = {
  init(
    environment: RelayEnvironment = Relay.Store,
    graphiqlPrinter: ?((request: RelayQueryRequest | RelayMutationRequest) => string),
  ): void {
    networkDebugger && networkDebugger.uninstall();
    // Without `groupCollapsed`, RelayNetworkDebug is too noisy.
    if (console.groupCollapsed) {
      networkDebugger = new RelayNetworkDebugger(environment, graphiqlPrinter);
    }
  },

  logRequest(request: RelayNetworkDebuggable): void {
    networkDebugger && networkDebugger.logRequest(request);
  },
};

module.exports = RelayNetworkDebug;
