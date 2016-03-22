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

const RelayNetworkDebug = {
  init(networkLayer: NetworkLayer): void {
    const initTime = performanceNow();

    const queryCallback = (id: number, pendingQuery, error, results) => {
      const time = performanceNow() - initTime;
      const name = pendingQuery.getDebugName();
      console.timeStamp(`← END: Relay query ${id} ${name}`);
      console.groupCollapsed(
        `%cRelay query ${id} ${time / 1000} ${name}`,
        `color:${error ? 'red' : 'black'};`
      );
      console.timeEnd(id);
      const query = pendingQuery.getQueryString();
      console.debug(
        '%c%s\n',
        'font-size:10px; color:#333; font-family:mplus-2m-regular,menlo,' +
        'monospaced;',
        query
      );
      error && console.error(error);
      results && console.log(results);
      console.groupEnd();
    };

    const handlePending = pendingQuery => {
      const id = queryID++;
      const name = pendingQuery.getDebugName();
      console.timeStamp(`START: Relay query ${id} ${name} →`);
      console.time(id);
      pendingQuery.then(
        response => queryCallback(id, pendingQuery, null, response),
        error => queryCallback(id, pendingQuery, error)
      );
    };

    let queryID = 0;
    Relay.injectNetworkLayer({
      sendQueries(requests: Array<RelayQueryRequest>): ?Promise {
        requests.forEach(handlePending);
        return networkLayer.sendQueries(requests);
      },
      sendMutation(request: RelayMutationRequest): ?Promise {
        handlePending(request);
        return networkLayer.sendMutation(request);
      },
      supports(...options: Array<string>): boolean {
        return networkLayer.supports(...options);
      },
    });

    const _fetch = global.fetch;
    global.fetch = function(url, options, ...args){
      const id = queryID++;
      const name = url.split('/')[2];
      console.timeStamp(`START: fetch ${id} ${name} →`);
      console.time(id);

      const fetchCallback = (error, results, args1) => {
        console.timeStamp(`← END: fetch ${id} ${name}`);
        console.groupCollapsed(
          `%cfetch ${id} ${name}`,
          `color:${error ? 'red' : 'black'};`
        );
        console.timeEnd(id);
        console.debug({url, options, args, args1});
        error && console.error(error);
        results && console.warn(results);
        try {
          results && console.debug(JSON.parse(results._bodyText));
        } catch (e) {}
        console.groupEnd();
      };

      return _fetch(url, options, ...args).then(
        (results, ...args1) => {
          fetchCallback(null, results, args1);
          return results;
        },
        (error, ...args1) => {
          fetchCallback(error, undefined, args1);
          return error;
        }
      );
    };
  },
};

module.exports = RelayNetworkDebug;
