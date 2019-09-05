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

export type ConnectionInternalEvent =
  | {|
      +kind: 'fetch',
      +args: Variables,
      +connectionID: ConnectionID,
      +edgeIDs: $ReadOnlyArray<?DataID>,
      +pageInfo: PageInfo,
      +request: RequestDescriptor,
    |}
  | {|
      +kind: 'insert',
      +args: Variables,
      +connectionID: ConnectionID,
      +edgeID: DataID,
      +request: RequestDescriptor,
    |};

export type ConnectionEvent<TEdge> =
  | {|
      +kind: 'fetch',
      +args: Variables,
      +edgeIDs: $ReadOnlyArray<?DataID>,
      +edgeData: {[DataID]: ?TEdge},
      +pageInfo: PageInfo,
    |}
  | {|+kind: 'update', edgeData: {[DataID]: ?TEdge}|}
  | {|+kind: 'insert', args: Variables, edge: ?TEdge, edgeID: DataID|};

export interface ConnectionResolver<TEdge, TState> {
  initialize(): TState;
  reduce(state: TState, event: ConnectionEvent<TEdge>): TState;
}

// Intentionally inexact
export type ConnectionReferenceObject<TEdge, TState> = {
  +__connection: ConnectionReference<TEdge, TState>,
};

export type ConnectionReference<TEdge, TState> = {|
  +variables: Variables,
  +edgeField: ReaderLinkedField,
  +id: ConnectionID,
  +label: string,
  +resolver: ConnectionResolver<TEdge, TState>,
|};

export type ConnectionSnapshot<TEdge, TState> = {|
  +edgeSnapshots: {[DataID]: TypedSnapshot<TEdge>},
  +id: ConnectionID,
  +reference: ConnectionReference<TEdge, TState>,
  +seenRecords: RecordMap,
  +state: TState,
|};

export type ConnectionSubscriptionSnapshot<TEdge, TState> = {|
  +id: string,
  +snapshot: ConnectionSnapshot<TEdge, TState>,
|};

export type ConnectionStoreSnapshot = {|
  events: $ReadOnlyArray<[ConnectionID, Array<ConnectionInternalEvent>]>,
  subscriptions: $ReadOnlyArray<ConnectionSubscriptionSnapshot<mixed, mixed>>,
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
