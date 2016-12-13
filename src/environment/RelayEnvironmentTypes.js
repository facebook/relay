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
  ConcreteFragment,
  ConcreteFragmentDefinition,
} from 'ConcreteQuery';
import type {DataID} from 'RelayInternalTypes';
import type {Variables} from 'RelayTypes';

/**
 * Represents any resource that must be explicitly disposed of. The most common
 * use-case is as a return value for subscriptions, where calling `dispose()`
 * would cancel the subscription.
 */
export type Disposable = {
  dispose(): void,
};

/**
 * A selector defines the starting point for a traversal into the graph for the
 * purposes of targeting a subgraph.
 */
export type Selector = {
  dataID: DataID,
  node: ConcreteFragment,
  variables: Variables,
};

/**
 * A representation of a selector and its results at a particular point in time.
 */
export type Snapshot = Selector & {
  data: ?SelectorData,
  seenRecords: {[key: DataID]: mixed},
};

/**
 * The results of executing a selector against the store.
 */
export type SelectorData = {[key: string]: mixed};

/**
 * An operation selector describes a specific instance of a GraphQL operation
 * with variables applied.
 *
 * - `root`: a selector intended for processing server results or retaining
 *   response data in the store.
 * - `fragment`: a selector intended for use in reading or subscribing to
 *   the results of the the operation.
 */
export type OperationSelector = {
  fragment: Selector,
  root: Selector,
  variables: Variables,
};

/**
 * The public API of Relay core. Represents an encapsulated environment with its
 * own in-memory cache.
 */
export interface Environment {
  lookup(
    selector: Selector,
  ): Snapshot,
  subscribe(
    snapshot: Snapshot,
    callback: (snapshot: Snapshot) => void,
  ): Disposable,
}

/**
 * The type of the `relay` property set on React context by the React/Relay
 * integration layer (e.g. QueryRenderer, FragmentContainer, etc).
 */
export type RelayContext = {
  environment: Environment,
  variables: Variables,
};

export type FragmentMap = {[key: string]: ConcreteFragmentDefinition};
