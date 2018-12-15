/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const {getOperationVariables} = require('./RelayConcreteVariables');
const {ROOT_ID} = require('./RelayStoreUtils');

import type {ConcreteRequest} from '../util/RelayConcreteNode';
import type {Variables} from '../util/RelayRuntimeTypes';
import type {OperationSelector} from './RelayStoreTypes';

/**
 * Creates an instance of the `OperationSelector` type defined in
 * `RelayStoreTypes` given an operation and some variables. The input variables
 * are filtered to exclude variables that do not match defined arguments on the
 * operation, and default values are populated for null values.
 */
function createOperationSelector(
  request: ConcreteRequest,
  variables: Variables,
): OperationSelector {
  const operation = request.operation;
  const operationVariables = getOperationVariables(operation, variables);
  const dataID = ROOT_ID;
  return {
    fragment: {
      dataID,
      node: request.fragment,
      variables: operationVariables,
    },
    node: request,
    root: {
      dataID,
      node: operation,
      variables: operationVariables,
    },
    variables: operationVariables,
  };
}

module.exports = {
  createOperationSelector,
};
