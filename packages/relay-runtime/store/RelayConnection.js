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

import type {ReaderLinkedField} from '../util/ReaderNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {
  RecordMap,
  RequestDescriptor,
  TypedSnapshot,
} from './RelayStoreTypes';

export opaque type ConnectionID: string = string;

export type ConnectionRecord = {|
  +__id: ConnectionID,
  +__typename: '__ConnectionRecord',
  +events: Array<ConnectionInternalEvent>,
|};

export type ConnectionMap = {[ConnectionID]: ?ConnectionRecord};

export type GetConnectionEvents = (
  connectionID: ConnectionID,
) => ?$ReadOnlyArray<ConnectionInternalEvent>;

export type ConnectionInternalEvent =
  | {|
      +kind: 'fetch',
      +args: Variables,
      +connectionID: ConnectionID,
      +edgeIDs: $ReadOnlyArray<?DataID>,
      +pageInfo: PageInfo,
      +request: RequestDescriptor,
      +stream: boolean,
    |}
  | {|
      +kind: 'insert',
      +args: Variables,
      +connectionID: ConnectionID,
      +edgeID: DataID,
      +request: RequestDescriptor,
    |}
  | {|
      +kind: 'stream.edge',
      +args: Variables,
      +connectionID: ConnectionID,
      +edgeID: DataID,
      +index: number,
      +request: RequestDescriptor,
    |}
  | {|
      +kind: 'stream.pageInfo',
      +args: Variables,
      +connectionID: ConnectionID,
      +pageInfo: PageInfo,
      +request: RequestDescriptor,
    |};

export type ConnectionEvent<TEdge> =
  | {|
      +kind: 'fetch',
      +args: Variables,
      +edges: $ReadOnlyArray<?TEdge>,
      +pageInfo: PageInfo,
      +stream: boolean,
    |}
  | {|+kind: 'update', +edgeData: {[DataID]: ?TEdge}|}
  | {|+kind: 'insert', +args: Variables, +edge: ?TEdge|}
  | {|
      +kind: 'stream.edge',
      +args: Variables,
      +edge: ?TEdge,
      +index: number,
    |}
  | {|
      +kind: 'stream.pageInfo',
      +args: Variables,
      +pageInfo: PageInfo,
    |};

export interface ConnectionResolver<TEdge, TState> {
  initialize(): TState;
  reduce(state: TState, event: ConnectionEvent<TEdge>): TState;
}

// Intentionally inexact
export type ConnectionReferenceObject<TEdge> = {
  +__connection: ConnectionReference<TEdge>,
};

// Note: The phantom TEdge type allows propagation of the `edges` field
// selections.
// eslint-disable-next-line no-unused-vars
export type ConnectionReference<TEdge> = {|
  +variables: Variables,
  +edgesField: ReaderLinkedField,
  +id: ConnectionID,
  +label: string,
|};

export type ConnectionSnapshot<TEdge, TState> = {|
  +edgeSnapshots: {[DataID]: TypedSnapshot<TEdge>},
  +id: ConnectionID,
  +reference: ConnectionReference<TEdge>,
  +seenRecords: RecordMap,
  +state: TState,
|};

export type PageInfo = {|
  endCursor: ?string,
  hasNextPage: ?boolean,
  hasPrevPage: ?boolean,
  startCursor: ?string,
|};

const CONNECTION_KEY = '__connection';
const CONNECTION_TYPENAME = '__ConnectionRecord';

function createConnectionID(parentID: DataID, label: string): ConnectionID {
  return `connection:${parentID}:${label}`;
}

function createConnectionRecord(connectionID: ConnectionID): ConnectionRecord {
  return {
    __id: connectionID,
    __typename: '__ConnectionRecord',
    events: [],
  };
}

module.exports = {
  createConnectionID,
  createConnectionRecord,
  CONNECTION_KEY,
  CONNECTION_TYPENAME,
};
