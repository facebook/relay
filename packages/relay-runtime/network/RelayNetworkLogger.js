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
 */

'use strict';

/* eslint-disable no-console-disallow */

const prettyStringify = require('prettyStringify');

import type {CacheConfig} from 'RelayCombinedEnvironmentTypes';
import type {ConcreteBatch} from 'RelayConcreteNode';
import type {FetchFunction, QueryPayload, UploadableMap} from 'RelayNetworkTypes';
import type {
  Variables,
} from 'RelayTypes';

export type GraphiQLPrinter = (batch: ConcreteBatch, variables: Variables) => string;

let queryID = 1;

const RelayNetworkLogger = {
  create(
    fetch: FetchFunction,
    graphiQLPrinter: GraphiQLPrinter
  ): FetchFunction {
    return (
      operation: ConcreteBatch,
      variables: Variables,
      cacheConfig: ?CacheConfig,
      uploadables?: UploadableMap,
    ): Promise<QueryPayload> => {
      const id = queryID++;
      const name = operation.name;

      const idName = `[${id}] Relay Modern: ${name}`;

      console.time && console.time(idName);

      const onSettled = (error: ?Error, response: ?QueryPayload): void => {
        console.groupCollapsed(`%c${idName}`, error ? 'color:red' : '');
        console.timeEnd && console.timeEnd(idName);
        console.log('GraphiQL:', graphiQLPrinter(operation, variables));
        console.log('Cache Config:', cacheConfig);
        console.log('Variables:', prettyStringify(variables));
        if (error) {
          console.error('Error:', error);
        }
        if (response) {
          console.log('Response:', response);
        }
        console.groupEnd();
      };

      const request = fetch(operation, variables, cacheConfig, uploadables);
      request.then(
        response => {
          onSettled(null, response);
        },
        error => {
          onSettled(error, null);
        },
      );
      return request;
    };
  },
};

module.exports = RelayNetworkLogger;
