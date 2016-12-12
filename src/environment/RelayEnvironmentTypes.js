/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayEnvironmentTypes
 * @flow
 */

'use strict';

import type {
  ConcreteFragmentDefinition,
} from 'ConcreteQuery';
import type {DataID} from 'RelayInternalTypes';
import type RelayQuery from 'RelayQuery';
import type {Variables} from 'RelayTypes';

/**
 * A selector defines the starting point for a traversal into the graph for the
 * purposes of targeting a subgraph.
 */
export type Selector = {
  dataID: DataID,
  node: ConcreteFragmentDefinition,
  variables: Variables,
};

/**
 * An operation selector describes a specific instance of a GraphQL operation
 * with variables applied.
 *
 * - `fragment`: a selector intended for use in reading or subscribing to
 *   the results of the the operation.
 * - `queries`: an object of queries that can be used to fetch the data for this
 *   operation.
 */
export type OperationSelector = {
  fragment: Selector,
  queries: Array<RelayQuery.Root>,
  variables: Variables,
};
