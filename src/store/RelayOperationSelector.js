/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayOperationSelector
 * @flow
 */

'use strict';

const QueryBuilder = require('QueryBuilder');

const invariant = require('invariant');

const {ROOT_ID} = require('RelayStoreConstants');
const {getOperationVariables} = require('RelayVariables');

import type {ConcreteOperationDefinition} from 'ConcreteQuery';
import type {OperationSelector} from 'RelayEnvironmentTypes';
import type {Variables} from 'RelayTypes';

/**
 * Creates an instance of the `OperationSelector` type defined in
 * `RelayEnvironmentTypes` given an operation and some variables. The input
 * variables are filtered to exclude variables that do not match defined
 * arguments on the operation, and default values are populated for null values.
 */
function createOperationSelector(
  operation: ConcreteOperationDefinition,
  variables: Variables,
): OperationSelector {
  const concreteFragment = QueryBuilder.getFragment(operation.node);
  invariant(
    concreteFragment,
    'RelayOperationSelector: Expected a query, got %s `%s`.',
    operation.node.kind,
    operation.name,
  );

  const operationVariables = getOperationVariables(operation, variables);
  const fragment = {
    dataID: ROOT_ID,
    node: concreteFragment,
    variables: operationVariables,
  };

  return {
    fragment,
    node: operation.node,
    root: fragment,
    variables: operationVariables,
  };
}

module.exports = {
  createOperationSelector,
};
