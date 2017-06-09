/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactRelayTestMocker
 * @format
 */

'use strict';

import {Environment, type Selector} from 'RelayStoreTypes';

import type {PayloadData} from 'RelayNetworkTypes';
import type {Variables} from 'RelayTypes';

type Config = {
  environment: Environment,
  query: string,
  variables: Variables,
  payload: PayloadData,
};

/**
 * The next id to return from `generateId()`.
 */
let nextId = 0;

const ReactRelayTestMocker = {
  /**
   * Get a unique id number (as a string). Note: will wrap around after 2^32
   * calls, if your test needs that many IDs.
   *
   * @returns a unique id string
   */
  generateId(): string {
    const toRet = nextId.toString();
    nextId++;

    return toRet;
  },

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
  write(config: Config): Selector {
    const {environment, query, variables, payload} = config;
    const {
      createOperationSelector,
      getOperation,
    } = environment.unstable_internal;

    // getOperation() expects a GraphQLTaggedNode, but tests still use string.
    const operation = getOperation((query: $FlowFixMe));
    const operationSelector = createOperationSelector(operation, variables);

    environment.commitPayload(operationSelector, payload);
    return operationSelector.fragment;
  },
};

module.exports = ReactRelayTestMocker;
