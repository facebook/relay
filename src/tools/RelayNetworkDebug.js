/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayNetworkDebug
 * @typechecks
 * @flow
 */

'use strict';

import type RelayMutationRequest from 'RelayMutationRequest';
const Relay = require('RelayPublic');
import type RelayQueryRequest from 'RelayQueryRequest';
import type {NetworkLayer} from 'RelayTypes';

const performanceNow = require('performanceNow');

export type RelayNetworkDebuggable = {
  name: string;
  type: string;
  promise: Promise;
  logResult: (error: ?Object, response: ?Object) => void;
};

class RelayNetworkDebugger {
  _fetch: Function;
  _initTime: number;
  _queryID: number;

  constructor(networkLayer: NetworkLayer) {
    this._initTime = performanceNow();
    this._queryID = 0;

    Relay.injectNetworkLayer({
      sendQueries: requests => {
        requests.forEach(request => {
          this.logRequest(createDebuggableFromRequest('Relay Query', request));
        });
        return networkLayer.sendQueries(requests);
      },
      sendMutation: request => {
        this.logRequest(createDebuggableFromRequest('Relay Mutation', request));
        return networkLayer.sendMutation(request);
      },
      supports(...options: Array<string>): boolean {
        return networkLayer.supports(...options);
      },
    });

    this._fetch = global.fetch;
    global.fetch = (url, options, ...args) => {
      const name = url.split('/')[2];
      this.logRequest(createDebuggableFromFetch(
        name,
        {url, options, args},
        this._fetch(url, options, ...args)
      ));
    };
  }

  uninstall(): void {
    global.fetch = this._fetch;
  }

  logRequest({name, type, promise, logResult}: RelayNetworkDebuggable): void {
    const id = this._queryID++;
    const timerName = `[${id}] Request Duration`;

    console.timeStamp(`START: [${id}] ${type}: ${name} →`);
    console.time(timerName);

    const onSettled = (error, response) => {
      const time = (performanceNow() - this._initTime) / 1000;
      console.timeStamp(`← END: [${id}] ${type}: ${name}`);
      console.groupCollapsed(
        `%c[${id}] ${type}: ${name} @ ${time}s`,
        `color:${error ? 'red' : 'black'};`
      );
      console.timeEnd(timerName);
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
  request: RelayQueryRequest | RelayMutationRequest
): RelayNetworkDebuggable {
  return {
    name: request.getDebugName(),
    type: 'Relay Query',
    promise: request.getPromise(),
    logResult(error, response) {
      console.debug(
        '%c%s\n',
        'font-size:10px; color:#333; font-family:mplus-2m-regular,menlo,' +
        'monospaced;',
        request.getQueryString()
      );
      error && console.error(error);
      response && console.log(response);
    },
  };
}

function createDebuggableFromFetch(
  name: string,
  config: Object,
  promise: Promise
): RelayNetworkDebuggable {
  return {
    name,
    type: 'Relay Mutation',
    promise,
    logResult(error, response) {
      console.debug(config);
      error && console.error(error);
      response && console.warn(response);
      try {
        response && console.debug(JSON.parse(response._bodyText));
      } catch (_) {
      }
    },
  };
}

let networkDebugger: ?RelayNetworkDebugger;

const RelayNetworkDebug = {
  init(networkLayer: NetworkLayer): void {
    networkDebugger && networkDebugger.uninstall();
    networkDebugger = new RelayNetworkDebugger(networkLayer);
  },
  logRequest(request: RelayNetworkDebuggable): void {
    networkDebugger && networkDebugger.logRequest(request);
  },
};

module.exports = RelayNetworkDebug;
