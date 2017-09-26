/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayModernOperationSelector
 * @flow
 * @format
 */

'use strict';

const {getOperationVariables} = require('RelayConcreteVariables');
const {ROOT_ID} = require('RelayStoreUtils');

import type {ConcreteBatch} from 'RelayConcreteNode';
import type {OperationSelector} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

/**
 * Creates an instance of the `OperationSelector` type defined in
 * `RelayStoreTypes` given an operation and some variables. The input variables
 * are filtered to exclude variables that do not match defined arguments on the
 * operation, and default values are populated for null values.
 */
function createOperationSelector(
  operation: ConcreteBatch,
  variables: Variables,
): OperationSelector {
  const operationVariables = getOperationVariables(operation, variables);
  const dataID = ROOT_ID;
  return {
    fragment: {
      dataID,
      node: operation.fragment,
      variables: operationVariables,
    },
    node: operation,
    root: {
      dataID,
      node: operation.query,
      variables: operationVariables,
    },
    variables: operationVariables,
  };
}

module.exports = {
  createOperationSelector,
};
