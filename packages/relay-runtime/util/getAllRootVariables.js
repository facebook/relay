/**
 * Copyright (c) Facebook, Inc. and its affiliates.
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

function getAllRootVariables(
  userSuppliedVariables: Variables,
  parameters: RequestParameters,
): Variables {
  if (parameters.providedVariables) {
    const allVariables = {};
    Object.assign(allVariables, userSuppliedVariables);
    parameters.providedVariables?.forEach(({name, provider}) => {
      allVariables[name] = provider.get();
    });
    return allVariables;
  } else {
    return userSuppliedVariables;
  }
}

module.exports = getAllRootVariables;
