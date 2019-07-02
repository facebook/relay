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

import type {Props} from '../store/RelayStoreTypes';
import type {DataID, Variables} from './RelayRuntimeTypes';

/*
 * An individual cached graph object.
 */
export type Record = {[key: string]: mixed};

/**
 * A collection of records keyed by id.
 */
export type RecordMap = {[dataID: DataID]: ?Record};

/**
 * A selector defines the starting point for a traversal into the graph for the
 * purposes of targeting a subgraph.
 */
export type CNormalizationSelector<TNormalizationNode> = {
  dataID: DataID,
  node: TNormalizationNode,
  variables: Variables,
};
export type CReaderSelector<TReaderNode> = {
  dataID: DataID,
  node: TReaderNode,
  variables: Variables,
};

/**
 * A representation of a selector and its results at a particular point in time.
 */
export type CSnapshot<TReaderNode, TOwner> = CReaderSelector<TReaderNode> & {
  data: ?SelectorData,
  seenRecords: RecordMap,
  isMissingData: boolean,
  owner: TOwner | null,
};

/**
 * The results of a selector given a store/RecordSource.
 */
export type SelectorData = {[key: string]: mixed};

/**
 * The results of reading the results of a FragmentMap given some input
 * `Props`.
 */
export type FragmentSpecResults = {[key: string]: mixed};

/**
 * A utility for resolving and subscribing to the results of a fragment spec
 * (key -> fragment mapping) given some "props" that determine the root ID
 * and variables to use when reading each fragment. When props are changed via
 * `setProps()`, the resolver will update its results and subscriptions
 * accordingly. Internally, the resolver:
 * - Converts the fragment map & props map into a map of `Selector`s.
 * - Removes any resolvers for any props that became null.
 * - Creates resolvers for any props that became non-null.
 * - Updates resolvers with the latest props.
 */
export interface CFragmentSpecResolver<TRequest> {
  /**
   * Stop watching for changes to the results of the fragments.
   */
  dispose(): void;

  /**
   * Get the current results.
   */
  resolve(): FragmentSpecResults;

  /**
   * Update the resolver with new inputs. Call `resolve()` to get the updated
   * results.
   */
  setProps(props: Props): void;

  /**
   * Override the variables used to read the results of the fragments. Call
   * `resolve()` to get the updated results.
   */
  setVariables(variables: Variables, node?: TRequest): void;

  /**
   * Subscribe to resolver updates.
   * Overrides existing callback (if one has been specified).
   */
  setCallback(callback: () => void): void;
}

export type CFragmentMap<TFragment> = {[key: string]: TFragment};

/**
 * An operation selector describes a specific instance of a GraphQL operation
 * with variables applied.
 *
 * - `root`: a selector intended for processing server results or retaining
 *   response data in the store.
 * - `fragment`: a selector intended for use in reading or subscribing to
 *   the results of the the operation.
 */
export type COperationDescriptor<TReaderNode, TNormalizationNode, TRequest> = {|
  +fragment: CReaderSelector<TReaderNode>,
  +node: TRequest,
  +root: CNormalizationSelector<TNormalizationNode>,
  +variables: Variables,
|};
