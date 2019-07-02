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

export type CFragmentMap<TFragment> = {[key: string]: TFragment};
