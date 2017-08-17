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

const RelayNetwork = require('RelayNetwork');

const areEqual = require('areEqual');
const emptyFunction = require('emptyFunction');
const invariant = require('invariant');
const isRelayModernEnvironment = require('isRelayModernEnvironment');
const warning = require('warning');

import type {ConcreteOperationDefinition} from 'ConcreteQuery';
import type {CacheConfig} from 'RelayCombinedEnvironmentTypes';
import type {ConcreteBatch} from 'RelayConcreteNode';
import type {QueryPayload, PayloadError} from 'RelayNetworkTypes';
import type {Environment, OperationSelector} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

type DataWriteConfig = {
  query: ConcreteBatch,
  variables: Variables,
  payload: QueryPayload,
};

type NetworkWriteConfig = {
  query: ConcreteBatch,
  variables?: Variables,
  payload: QueryPayload | (Variables => QueryPayload),
};

type OperationType = ConcreteBatch | ConcreteOperationDefinition;

type PendingFetch = {
  operation: OperationType,
  variables?: Variables,
  cacheConfig: ?CacheConfig,
  ident: string,
  deferred: {resolve: Function, reject: Function},
  operationSelector: OperationSelector,
};

/**
 * The next id to return from `generateId()`.
 */
let nextId = 0;

/**
 * The pending network fetches for the mocked network.
 */
let pendingFetches: Array<PendingFetch> = [];

class ReactRelayTestMocker {
  _environment: Environment;
  _defaults: {[string]: $PropertyType<NetworkWriteConfig, 'payload'>};

  constructor(env: Environment) {
    this._defaults = {};

    if (isRelayModernEnvironment(env)) {
      this._mockNetworkLayer(env);
    } else {
      warning(
        false,
        'Netork mocking is currently only supported in Relay Modern. ' +
          'You will not be able to resolve requests made with Relay ' +
          'Classic environments.',
      );
    }

    this._environment = env;
  }

  /**
   * Get a unique id number (as a string). Note: will wrap around after 2^32
   * calls, if your test needs that many IDs.
   *
   * @returns a unique id string
   */
  static generateId(): string {
    const toRet = nextId.toString();
    nextId++;

    return toRet;
  }

  /**
   * Create a unique identifier for a (query, variables) pair.
   * @param operation: the operation associated with the query
   * @param variables: the variables associated with this invocation of the
   * query
   *
   * @returns a string which can later be used to uniquely identify this query
   * in the list of pending queries
   */
  static getIdentifier(operation: OperationType): string {
    const queryName = operation.name;
    return queryName;
  }

  /**
   * Remove variables that we don't need from the query that will make it more
   * annoying to test (e.g. client_mutation_id, actor_id)
   */
  static stripUnused(variables: Variables): Variables {
    if (variables.input) {
      const toRemove = [
        'client_mutation_id',
        'actor_id',
        'clientMutationId',
        'actorId',
      ];
      toRemove.forEach(item => (variables.input[item] = undefined));
    }

    return variables;
  }

  /**
   * Replace the environment's network layer with a mocked out one to allow for
   * better testing. Mocking the network allows testing without using a mocked
   * out QueryRenderer, and will allow for easier testing of components wrapped
   * in refetch containers, for example. It also allows test writers to see how
   * their components behave under error conditions.
   */
  _mockNetworkLayer(env: Environment): Environment {
    const fetch = (operation, variables, cacheConfig) => {
      let resolve = emptyFunction;
      let reject = emptyFunction;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });

      const strippedVars = ReactRelayTestMocker.stripUnused(variables);
      const ident = ReactRelayTestMocker.getIdentifier(operation);
      const {createOperationSelector} = env.unstable_internal;

      // there's a default value for this query, use it
      if (this._defaults[ident]) {
        const payload = this._defaults[ident];
        if (typeof payload === 'function') {
          return payload(strippedVars);
        } else {
          return payload;
        }
      }

      const operationSelector = createOperationSelector(operation, variables);
      pendingFetches.push({
        ident,
        cacheConfig,
        deferred: {resolve, reject},
        operation,
        variables,
        operationSelector,
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
    }

    function rejectQuery(
      toResolve: PendingFetch,
      payload: {error: PayloadError},
    ): void {
      pendingFetches = pendingFetches.filter(pending => pending !== toResolve);

      const {deferred} = toResolve;
      deferred.reject(payload.error);
    }

    (env: any).mock = {
      isLoading,
      rejectQuery,
      resolveRawQuery,
      fetch,
    };

    (env: any).hasMockedNetwork = true;

    (env: any).__setNet(RelayNetwork.create(fetch));
    return env;
  }

  _getDefaults() {
    return this._defaults;
  }

  /**
   * set a default payload for a given query
   */
  setDefault(toSet: NetworkWriteConfig): void {
    const {query, payload} = toSet;
    const operation = query;
    const ident = ReactRelayTestMocker.getIdentifier(operation);

    this._defaults[ident] = payload;
  }

  /**
   * remove a default payload for a given query
   */
  unsetDefault(toUnset: NetworkWriteConfig): void {
    const {query} = toUnset;
    const operation = query;
    const ident = ReactRelayTestMocker.getIdentifier(operation);

    delete this._defaults[ident];
  }

  /**
   * Write directly to the Relay store instead of trying to resolve a query that
   * was sent via the network.
   *
   * Use this method when testing a component wrapped in a fragment container
   * (via `createFragmentContainer`). The component under test should also be
   * wrapped in a `RelayTestRenderer`.
   */
  dataWrite(config: DataWriteConfig): void {
    const {query, variables, payload} = config;
    const {createOperationSelector} = this._environment.unstable_internal;

    const operationSelector = createOperationSelector(query, variables);

    invariant(
      payload.data != null && payload.errors === undefined,
      'Only `data` can be written when using `writeDirect`. You may need to ' +
        'wrap your payload in an object like `{data: payload}`.',
    );

    this._environment.commitPayload(operationSelector, payload.data);
  }

  /**
   * Write the data specified in config's payload to the instance's environment.
   * NOTE: callers may need to invoke `jest.runOnlyPendingTimers()` after
   * calling this function.
   *
   * @param config: an object containing the data to write and the query and
   * variables that the payload is simulating a response to
   */
  networkWrite(config: NetworkWriteConfig): void {
    invariant(
      (this._environment: any).hasMockedNetwork,
      'You cannot resolve queries without a mocked environment. Did you mean ' +
        'to use `writeDirect` instead?',
    );
    const {query, variables, payload} = config;

    const ident = ReactRelayTestMocker.getIdentifier(query);

    let usedVars;

    if (variables) {
      const {createOperationSelector} = this._environment.unstable_internal;
      const operationSelector = createOperationSelector(query, variables);
      usedVars = ReactRelayTestMocker.stripUnused(operationSelector.variables);
    }

    let toResolve;
    pendingFetches.forEach(pending => {
      const pendingVars = pending.variables;
      if (pending.ident === ident) {
        invariant(
          !toResolve || variables,
          'Multiple queries with the same name are currently pending. You ' +
            'should pass variables to `write` so that it can determine which ' +
            'to resolve',
        );
        if (variables) {
          if (areEqual(pendingVars, usedVars)) {
            toResolve = pending;
          }
        } else {
          toResolve = pending;
        }
      }
    });

    const varMessage = usedVars
      ? ' - variables: ' + JSON.stringify(usedVars)
      : '';

    invariant(
      toResolve,
      'You are attempting to resolve a query that has not been fetched ' +
        '(%s%s).\n\tPlease ensure you passed the correct variables, or use ' +
        '`writeDirect` instead.',
      ident,
      varMessage,
    );

    const realPayload =
      typeof payload === 'function' ? payload(toResolve.variables) : payload;

    // if there are errors, reject the query
    if (realPayload.errors != null && realPayload.errors.length > 0) {
      (this._environment: any).mock.rejectQuery(toResolve, {
        error: realPayload.errors[0],
      });
    } else {
      (this._environment: any).mock.resolveRawQuery(toResolve, realPayload);
    }
  }
}

module.exports = ReactRelayTestMocker;
