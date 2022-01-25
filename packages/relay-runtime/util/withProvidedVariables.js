/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {ProvidedVariablesType} from './RelayConcreteNode';
import type {Variables} from './RelayRuntimeTypes';

const areEqual = require('areEqual');
const warning = require('warning');

const WEAKMAP_SUPPORTED = typeof WeakMap === 'function';
const debugCache = WEAKMAP_SUPPORTED ? new WeakMap() : new Map();

function withProvidedVariables(
  userSuppliedVariables: Variables,
  providedVariables: ?ProvidedVariablesType,
): Variables {
  if (providedVariables != null) {
    const operationVariables = {};
    Object.assign(operationVariables, userSuppliedVariables);
    Object.keys(providedVariables).forEach((varName: string) => {
      const providerFunction = providedVariables[varName].get;
      const providerResult = providerFunction();

      // people like to ignore these warnings, so use the cache to
      // enforce that we only compute the value the first time
      if (!debugCache.has(providerFunction)) {
        debugCache.set(providerFunction, providerResult);
        operationVariables[varName] = providerResult;
      } else {
        const cachedResult = debugCache.get(providerFunction);

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

module.exports = withProvidedVariables;
