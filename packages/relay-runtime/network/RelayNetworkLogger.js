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

const RelayModernRecord = require('RelayModernRecord');
const RelayReader = require('RelayReader');

const {createOperationSelector} = require('RelayModernOperationSelector');
const prettyStringify = require('prettyStringify');

import type {CacheConfig, Disposable} from 'RelayCombinedEnvironmentTypes';
import type {ConcreteBatch} from 'RelayConcreteNode';
import type {
  FetchFunction,
  Network,
  SubscribeFunction,
  PromiseOrValue,
  QueryPayload,
  RelayResponsePayload,
  UploadableMap,
} from 'RelayNetworkTypes';
import type {Variables} from 'RelayTypes';

export type GraphiQLPrinter = (
  batch: ConcreteBatch,
  variables: Variables,
) => string;

let queryID = 1;

const RelayNetworkLogger = {
  wrap(
    network: Network,
    printer?: GraphiQLPrinter,
  ): Network {
    return {
      request: (operation, variables, cacheConfig, uploadables, observer) => {
        const logger = new RequestLogger(printer, operation, variables, cacheConfig);
        return network.request(operation, variables, cacheConfig, uploadables, {
          onCompleted: response => {
            logger.onResponse(null, response);
            observer.onCompleted(response);
          },
          onError: error => {
            logger.onResponse(error, null);
            observer.onError(error);
          },
        });
      },
      requestStream: (operation, variables, cacheConfig, observer) => {
        const logger = new RequestLogger(printer, operation, variables, cacheConfig);
        return network.requestStream(operation, variables, cacheConfig, {
          ...observer,
          onNext: response => {
            logger.onResponse(null, response);
            observer.onNext && observer.onNext(response);
          },
          onError: error => {
            logger.onResponse(error, null);
            observer.onError && observer.onError(error);
          },
        });
      },
    };
  },
};

/**
 * @private
 */
class RequestLogger {
  _cacheConfig: ?CacheConfig;
  _id: number;
  _name: string;
  _operation: ConcreteBatch;
  _printer: ?GraphiQLPrinter;
  _variables: Variables;

  constructor(printer: ?GraphiQLPrinter, operation: ConcreteBatch, variables: Variables, cacheConfig: ?CacheConfig) {
    this._cacheConfig = cacheConfig;
    this._id = queryID++;
    this._name = `[${this._id}] Relay Modern: ${operation.query.operation} ${operation.name}`;
    this._operation = operation;
    this._printer = printer;
    this._variables = variables;

    console.time && console.time(this._name);
  }

  onResponse(error: ?Error, payload: RelayResponsePayload): void {
    console.groupCollapsed(`%c${this._name}`, error ? 'color:red' : '');
    console.timeEnd && console.timeEnd(this._name);
    if (this._printer) {
      console.log('GraphiQL:', this._printer(this._operation, this._variables));
    } else {
      console.log(this._name);
    }
    console.log('Cache Config:', this._cacheConfig);
    console.log('Variables:', prettyStringify(this._variables));
    if (error) {
      console.log('Error:', error);
    }
    if (payload) {
      const operation = createOperationSelector(this._operation, this._variables);
      const snapshot = RelayReader.read(
        payload.source,
        operation.root,
        RelayModernRecord,
      );
      console.log('Response:', snapshot.data);
    }
    console.groupEnd();
  }
}

module.exports = RelayNetworkLogger;
