/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {INetwork} from '../network/RelayNetworkTypes';
import type {ProvidedVariablesType} from './RelayConcreteNode';
import type {Variables} from './RelayRuntimeTypes';

const areEqual = require('areEqual');
const warning = require('warning');

type ProviderValueCache =
  Map<() => unknown, unknown> | WeakMap<() => unknown, unknown>;

const WEAKMAP_SUPPORTED = typeof WeakMap === 'function';

function createProviderValueCache(): ProviderValueCache {
  return WEAKMAP_SUPPORTED ? new WeakMap() : new Map();
}

/**
 * Provider values are memoized per network rather than for the lifetime of the
 * module: a server process serves many requests, and each of them builds its
 * own network, so pinning the first value a provider ever returned would leak
 * one request's state into every later one. Without WeakMap there is no way to
 * scope values to a network without retaining every network, so they stay
 * process wide in that case.
 */
let cachesByNetwork: ?WeakMap<INetwork, ProviderValueCache> = WEAKMAP_SUPPORTED
  ? new WeakMap()
  : null;
let processWideCache: ProviderValueCache = createProviderValueCache();

function getProviderValueCache(network: ?INetwork): ProviderValueCache {
  const caches = cachesByNetwork;
  if (network == null || caches == null) {
    return processWideCache;
  }
  const cached = caches.get(network);
  if (cached != null) {
    return cached;
  }
  const cache = createProviderValueCache();
  caches.set(network, cache);
  return cache;
}

function withProvidedVariables(
  userSuppliedVariables: Variables,
  providedVariables: ?ProvidedVariablesType,
  network?: ?INetwork,
): Variables {
  if (providedVariables != null) {
    const cache = getProviderValueCache(network);
    const operationVariables: {[string]: unknown} = {};
    // $FlowFixMe[unsafe-object-assign]
    Object.assign(operationVariables, userSuppliedVariables);
    Object.keys(providedVariables).forEach((varName: string) => {
      const providerFunction = providedVariables[varName].get;
      const providerResult = providerFunction();

      // people like to ignore these warnings, so use the cache to
      // enforce that we only compute the value the first time
      if (!cache.has(providerFunction)) {
        cache.set(providerFunction, providerResult);
        operationVariables[varName] = providerResult;
      } else {
        const cachedResult = cache.get(providerFunction);

        if (__DEV__) {
          warning(
            areEqual(providerResult, cachedResult),
            'Relay: Expected function `%s` for provider `%s` to be a pure function, ' +
              'but got conflicting return values `%s` and `%s`',
            providerFunction.name,
            varName,
            providerResult,
            cachedResult,
          );
        }
        operationVariables[varName] = cachedResult;
      }
    });
    return operationVariables;
  } else {
    return userSuppliedVariables;
  }
}

withProvidedVariables.tests_only_resetDebugCache = (
  __DEV__
    ? () => {
        processWideCache = createProviderValueCache();
        cachesByNetwork = WEAKMAP_SUPPORTED ? new WeakMap() : null;
      }
    : undefined
) as void | (() => void);

module.exports = withProvidedVariables;
