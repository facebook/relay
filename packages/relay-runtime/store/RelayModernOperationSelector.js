/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const RelayConcreteNode = require('../util/RelayConcreteNode');

const {getOperationVariables} = require('./RelayConcreteVariables');
const {ROOT_ID} = require('./RelayStoreUtils');

import type {RequestNode, ConcreteOperation} from '../util/RelayConcreteNode';
import type {Variables} from '../util/RelayRuntimeTypes';
import type {OperationSelector} from './RelayStoreTypes';

/**
 * Creates an instance of the `OperationSelector` type defined in
 * `RelayStoreTypes` given an operation and some variables. The input variables
 * are filtered to exclude variables that do not match defined arguments on the
 * operation, and default values are populated for null values.
 */
function createOperationSelector(
  request: RequestNode,
  variables: Variables,
  operationFromBatch?: ConcreteOperation,
): OperationSelector {
  const operation =
    operationFromBatch ||
    (request.kind === RelayConcreteNode.BATCH_REQUEST
      ? request.requests[0].operation
      : request.operation);

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
