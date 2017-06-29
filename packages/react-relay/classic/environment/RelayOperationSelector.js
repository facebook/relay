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
 * @format
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
 * @public
 *
 * Implementation of `RelayCore#createOperationSelector()` defined in
 * `RelayEnvironmentTypes` for the classic core.
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
    node: operation,
    root: fragment,
    variables: operationVariables,
  };
}

module.exports = {
  createOperationSelector,
};
