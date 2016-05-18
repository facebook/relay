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

import type {ChangeSubscription} from 'RelayInternalTypes';
import type RelayMutationRequest from 'RelayMutationRequest';
import type RelayEnvironment from 'RelayEnvironment';
const Relay = require('RelayPublic');
import type RelayQueryRequest from 'RelayQueryRequest';

const performanceNow = require('performanceNow');

export type RelayNetworkDebuggable = {
  name: string;
  type: string;
  promise: Promise<any>;
  logResult: (error: ?Object, response: ?Object) => void;
};

class RelayNetworkDebugger {
  _initTime: number;
  _queryID: number;
  _subscription: ChangeSubscription;

  constructor(environment: RelayEnvironment) {
    this._initTime = performanceNow();
    this._queryID = 0;
    this._subscription = environment.addNetworkSubscriber(
      request =>
        this.logRequest(createDebuggableFromRequest('Relay Query', request)),
      request =>
        this.logRequest(createDebuggableFromRequest('Relay Mutation', request))
    );
  }

  uninstall(): void {
    this._subscription.remove();
  }

  logRequest({name, type, promise, logResult}: RelayNetworkDebuggable): void {
    const id = this._queryID++;
    const timerName = `[${id}] Request Duration`;

    /* eslint-disable no-console */
    console.timeStamp && console.timeStamp(`START: [${id}] ${type}: ${name} →`);
    console.time && console.time(timerName);

    const onSettled = (error, response) => {
      const time = (performanceNow() - this._initTime) / 1000;
      console.timeStamp && console.timeStamp(`← END: [${id}] ${type}: ${name}`);
      const groupName = `%c[${id}] ${type}: ${name} @ ${time}s`;
      console.groupCollapsed ?
        console.groupCollapsed(
          groupName,
          `color:${error ? 'red' : 'black'};`
        ) :
        console.log(groupName);
      console.timeEnd && console.timeEnd(timerName);
      logResult(error, response);
      console.groupEnd && console.groupEnd();
    };
    /* eslint-enable no-console */

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
    type,
    promise: request.getPromise(),
    logResult(error, response) {
      /* eslint-disable no-console */
      console.debug && console.debug(
        '%c%s\n',
        'font-size:10px; color:#333; font-family:mplus-2m-regular,menlo,' +
        'monospaced;',
        request.getQueryString()
      );
      console.log('Request variables\n', request.getVariables());
      error && console.error(error);
      response && console.log(response);
      /* eslint-enable no-console */
    },
  };
}

let networkDebugger: ?RelayNetworkDebugger;

const RelayNetworkDebug = {
  init(environment: RelayEnvironment = Relay.Store): void {
    networkDebugger && networkDebugger.uninstall();
    networkDebugger = new RelayNetworkDebugger(environment);
  },

  logRequest(request: RelayNetworkDebuggable): void {
    networkDebugger && networkDebugger.logRequest(request);
  },
};

module.exports = RelayNetworkDebug;
