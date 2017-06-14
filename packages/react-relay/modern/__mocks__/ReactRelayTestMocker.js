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

const RelayNetwork = require('RelayNetwork');

const stableStringify = require('stableStringify');

import {Environment, type Selector} from 'RelayStoreTypes';

import type {ConcreteOperationDefinition} from 'ConcreteQuery';
import type {CacheConfig} from 'RelayCombinedEnvironmentTypes';
import type {ConcreteBatch} from 'RelayConcreteNode';
import type {GraphQLTaggedNode} from 'RelayModernGraphQLTag';
import type {QueryPayload, PayloadError} from 'RelayNetworkTypes';
import type {Variables} from 'RelayTypes';

type Config = {
  environment: Environment,
  query: GraphQLTaggedNode,
  variables: Variables,
  payload: QueryPayload,
};

type PendingFetch = {
  query: GraphQLTaggedNode,
  variables: Variables,
  cacheConfig: CacheConfig,
  ident: string,
  deferred: {resolve: () => mixed, reject: () => mixed},
};

/**
 * The next id to return from `generateId()`.
 */
let nextId = 0;

/**
 * The pending network fetches for the mocked network.
 */
let pendingFetches: Array<PendingFetch> = [];

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
   * Create a unique identifier for a (query, variables) pair.
   * @param operation: the operation associated with the query
   * @param variables: the variables associated with this invocation of the
   * query
   *
   * @returns a string which can later be used to uniquely identify this query
   * in the list of pending queries
   */
  getIdentifier(
    operation: ConcreteBatch | ConcreteOperationDefinition,
    variables: Variables,
  ): string {
    const queryName = operation.name;
    return queryName + '_' + stableStringify(variables);
  },

  /**
   * Write the data specified in config's payload to the environment sepcified
   * in config.
   *
   * @param config: an object containing the data to write, the environment to
   * write it to, and the query and variables that the payload is simulating a
   * response to
   *
   * @returns a selector that can be used to access the written data, or nothing
   * if the query is resolved via the network layer
   */
  write(config: Config): ?Selector {
    const {environment, query, variables, payload} = config;
    const {
      createOperationSelector,
      getOperation,
    } = environment.unstable_internal;

    // getOperation() expects a GraphQLTaggedNode, but tests still use string.
    const operation = getOperation((query: $FlowFixMe));
    const ident = ReactRelayTestMocker.getIdentifier(operation, variables);

    const toResolve = pendingFetches.find(pending => pending.ident === ident);

    // the query was fetched on the network, should resolve it via network
    if (toResolve) {
      environment.mock.resolveRawQuery(toResolve, payload);
      return null;
    } else {
      const operationSelector = createOperationSelector(operation, variables);
      environment.commitPayload(operationSelector, payload);
      return operationSelector.fragment;
    }
  },

  /**
   * Replace the environment's network layer with a mocked out one to allow for
   * better testing. Mocking the network allows testing without using a mocked
   * out QueryRenderer, and will allow for easier testing of components wrapped
   * in refetch containers, for example. It also allows test writers to see how
   * their components behave under error conditions.
   */
  mockNetworkLayer(env: Environment): Environment {
    const fetch = (query, variables, cacheConfig) => {
      let resolve, reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      const ident = query.name + '_' + stableStringify(variables);
      pendingFetches.push({
        ident,
        cacheConfig,
        deferred: {resolve, reject},
        query,
        variables,
      });
      return promise;
    };

    function isLoading(ident: string): boolean {
      return pendingFetches.some(pending => pending.ident === ident);
    }

    function resolveRawQuery(
      toResolve: PendingFetch,
      payload: QueryPayload,
    ): void {
      pendingFetches = pendingFetches.filter(pending => pending !== toResolve);

      const {deferred} = toResolve;
      deferred.resolve(payload);
      jest.runOnlyPendingTimers();
    }

    function rejectQuery(
      toResolve: PendingFetch,
      payload: {error: PayloadError},
    ): void {
      pendingFetches = pendingFetches.filter(pending => pending !== toResolve);

      const {deferred} = toResolve;
      deferred.reject(payload);
      jest.runOnlyPendingTimers();
    }

    (env: any).mock = {
      isLoading,
      rejectQuery,
      resolveRawQuery,
      fetch,
    };

    (env: any).hasMockedNetwork = true;

    (env: any).setNet(RelayNetwork.create(fetch));
    return env;
  },
};

module.exports = ReactRelayTestMocker;
