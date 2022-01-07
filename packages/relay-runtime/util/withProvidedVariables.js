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

import type {RequestParameters} from './RelayConcreteNode';
import type {Variables} from './RelayRuntimeTypes';

function withProvidedVariables(
  userSuppliedVariables: Variables,
  parameters: RequestParameters,
): Variables {
  const providedVariables = parameters.providedVariables;
  if (providedVariables != null) {
    const operationVariables = {};
    Object.assign(operationVariables, userSuppliedVariables);
    Object.keys(providedVariables).forEach((varName: string) => {
      operationVariables[varName] = providedVariables[varName].get();
    });
    return operationVariables;
  } else {
    return userSuppliedVariables;
  }
}

module.exports = withProvidedVariables;
