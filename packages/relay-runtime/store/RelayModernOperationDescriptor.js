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

const deepFreeze = require('../util/deepFreeze');

const {getOperationVariables} = require('./RelayConcreteVariables');
const {
  createNormalizationSelector,
  createReaderSelector,
} = require('./RelayModernSelector');
const {ROOT_ID} = require('./RelayStoreUtils');

import type {ConcreteRequest} from '../util/RelayConcreteNode';
import type {Variables} from '../util/RelayRuntimeTypes';
import type {OperationDescriptor} from './RelayStoreTypes';

/**
 * Creates an instance of the `OperationDescriptor` type defined in
 * `RelayStoreTypes` given an operation and some variables. The input variables
 * are filtered to exclude variables that do not match defined arguments on the
 * operation, and default values are populated for null values.
 */
function createOperationDescriptor(
  request: ConcreteRequest,
  variables: Variables,
): OperationDescriptor {
  const operation = request.operation;
  const operationVariables = getOperationVariables(operation, variables);
  const dataID = ROOT_ID;
  const operationDescriptor = {
    fragment: createReaderSelector(
      request.fragment,
      dataID,
      operationVariables,
    ),
    node: request,
    root: createNormalizationSelector(operation, dataID, operationVariables),
    variables: operationVariables,
  };
  if (__DEV__) {
    // Freeze the properties of an OperationDescriptor but not the object:
    // - Freezing properties short-circuits a deepFreeze of snapshots
    //   that contain an OperationDescriptor via their selector's owner,
    //   avoiding stack overflow on larger queries.
    // - Not freezing the object allows overriding properties in tests,
    //   such as configuring a custom  toJSON() for debugging.
    Object.freeze(operationDescriptor.fragment);
    Object.freeze(operationDescriptor.node);
    Object.freeze(operationDescriptor.root);
    deepFreeze(operationDescriptor.variables);
  }
  return operationDescriptor;
}

module.exports = {
  createOperationDescriptor,
};
