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

const QueryBuilder = require('../query/QueryBuilder');

const invariant = require('invariant');

const {getOperationVariables} = require('../query/RelayVariables');
const {ROOT_ID} = require('../store/RelayStoreConstants');

import type {ConcreteOperationDefinition} from '../query/ConcreteQuery';
import type {OperationSelector} from './RelayEnvironmentTypes';
import type {Variables} from 'RelayRuntime';

/**
 * @public
 *
 * Implementation of `RelayCore#createOperationSelector()` defined in
 * `RelayEnvironmentTypes` for the classic core.
 */
function createOperationSelector(
  operation: ConcreteOperationDefinition,
  variables: Variables,
  // unused param for compatibility with modern API
  _modernOperation?: any,
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
