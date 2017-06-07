/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactRelayTestMocker
 * @flow
 * @format
 */

'use strict';

import {Environment} from 'RelayStoreTypes';

import type {PayloadData} from 'RelayNetworkTypes';
import type {Variables} from 'RelayTypes';

type Config = {
  environment: Environment,
  query: string,
  variables: Variables,
  payload: PayloadData,
};

class ReactRelayTestMocker {
  /**
   * the next id to return from `generateId()`
   */
  static nextId = 0;

  /**
   * Get a unique id number (as a string). Note: will wrap around after 2^32
   * calls, if your test needs that many IDs.
   *
   * @returns a unique id string
   */
  static generateId(): string {
    const toRet = ReactRelayTestMocker.nextId.toString();
    ReactRelayTestMocker.nextId++;

    return toRet;
  }

  /**
   * Write the data specified in config's payload to the environment sepcified
   * in config.
   *
   * @param config: an object containing the data to write, the environment to
   * write it to, and the query and variables that the payload is simulating a
   * response to
   *
   * @returns a selector that can be used to access the written data
   */
  static write(config: Config): Selector {
    const {environment, query, variables, payload} = config;
    const {
      createOperationSelector,
      getOperation,
    } = environment.unstable_internal;

    const operation = getOperation(query);
    const operationSelector = createOperationSelector(operation, variables);

    environment.commitPayload(operationSelector, payload);
    return operationSelector.fragment;
  }
}

module.exports = ReactRelayTestMocker;
