/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const RelayConnectionInterface = require('./RelayConnectionInterface');

const getRelayHandleKey = require('../../util/getRelayHandleKey');
const invariant = require('invariant');
const warning = require('warning');

const {generateClientID} = require('../../store/ClientID');

import type {
  HandleFieldPayload,
  RecordProxy,
  ReadOnlyRecordProxy,
  RecordSourceProxy,
} from '../../store/RelayStoreTypes';
import type {DataID, Variables} from '../../util/RelayRuntimeTypes';

export type ConnectionMetadata = {
  path: ?Array<string>,
  direction: ?('forward' | 'backward' | 'bidirectional'),
  cursor: ?string,
  count: ?string,
  stream?: boolean,
  ...
};

const CONNECTION = 'connection';

// Per-instance incrementing index used to generate unique edge IDs
const NEXT_EDGE_INDEX = '__connection_next_edge_index';

/**
 * @public
 *
 * A default runtime handler for connection fields that appends newly fetched
 * edges onto the end of a connection, regardless of the arguments used to fetch
 * those edges.
 */
function update(store: RecordSourceProxy, payload: HandleFieldPayload): void {
  const record = store.get(payload.dataID);
  if (!record) {
    return;
  }

  const {
    EDGES,
    END_CURSOR,
    HAS_NEXT_PAGE,
    HAS_PREV_PAGE,
    PAGE_INFO,
    PAGE_INFO_TYPE,
    START_CURSOR,
  } = RelayConnectionInterface.get();

  const serverConnection = record.getLinkedRecord(payload.fieldKey);
  const serverPageInfo =
    serverConnection && serverConnection.getLinkedRecord(PAGE_INFO);
  if (!serverConnection) {
    record.setValue(null, payload.handleKey);
    return;
  }
  // In rare cases the handleKey field may be unset even though the client
  // connection record exists, in this case new edges should still be merged
  // into the existing client connection record (and the field reset to point
  // to that record).
  const clientConnectionID = generateClientID(
    record.getDataID(),
    payload.handleKey,
  );
  const clientConnectionField = record.getLinkedRecord(payload.handleKey);
  const clientConnection =
    clientConnectionField ?? store.get(clientConnectionID);
  let clientPageInfo =
    clientConnection && clientConnection.getLinkedRecord(PAGE_INFO);
  if (!clientConnection) {
    // Initial fetch with data: copy fields from the server record
    const connection = store.create(
      clientConnectionID,
      serverConnection.getType(),
    );
    connection.setValue(0, NEXT_EDGE_INDEX);
    connection.copyFieldsFrom(serverConnection);
    let serverEdges = serverConnection.getLinkedRecords(EDGES);
    if (serverEdges) {
      serverEdges = serverEdges.map(edge =>
        buildConnectionEdge(store, connection, edge),
      );
      connection.setLinkedRecords(serverEdges, EDGES);
    }
    record.setLinkedRecord(connection, payload.handleKey);

    clientPageInfo = store.create(
      generateClientID(connection.getDataID(), PAGE_INFO),
      PAGE_INFO_TYPE,
    );
    clientPageInfo.setValue(false, HAS_NEXT_PAGE);
    clientPageInfo.setValue(false, HAS_PREV_PAGE);
    clientPageInfo.setValue(null, END_CURSOR);
    clientPageInfo.setValue(null, START_CURSOR);
    if (serverPageInfo) {
      clientPageInfo.copyFieldsFrom(serverPageInfo);
    }
    connection.setLinkedRecord(clientPageInfo, PAGE_INFO);
  } else {
    if (clientConnectionField == null) {
      // If the handleKey field was unset but the client connection record
      // existed, update the field to point to the record
      record.setLinkedRecord(clientConnection, payload.handleKey);
    }
    const connection = clientConnection;
    // Subsequent fetches:
    // - updated fields on the connection
    // - merge prev/next edges, de-duplicating by node id
    // - synthesize page info fields
    let serverEdges = serverConnection.getLinkedRecords(EDGES);
    if (serverEdges) {
      serverEdges = serverEdges.map(edge =>
        buildConnectionEdge(store, connection, edge),
      );
    }
    const prevEdges = connection.getLinkedRecords(EDGES);
    const prevPageInfo = connection.getLinkedRecord(PAGE_INFO);
    connection.copyFieldsFrom(serverConnection);
    // Reset EDGES and PAGE_INFO fields
    if (prevEdges) {
      connection.setLinkedRecords(prevEdges, EDGES);
    }
    if (prevPageInfo) {
      connection.setLinkedRecord(prevPageInfo, PAGE_INFO);
    }

    let nextEdges = [];
    const args = payload.args;
    if (prevEdges && serverEdges) {
      if (args.after != null) {
        // Forward pagination from the end of the connection: append edges
        if (
          clientPageInfo &&
          args.after === clientPageInfo.getValue(END_CURSOR)
        ) {
          const nodeIDs = new Set();
          mergeEdges(prevEdges, nextEdges, nodeIDs);
          mergeEdges(serverEdges, nextEdges, nodeIDs);
        } else {
          warning(
            false,
            'RelayConnectionHandler: Unexpected after cursor `%s`, edges must ' +
              'be fetched from the end of the list (`%s`).',
            args.after,
            clientPageInfo && clientPageInfo.getValue(END_CURSOR),
          );
          return;
        }
      } else if (args.before != null) {
        // Backward pagination from the start of the connection: prepend edges
        if (
          clientPageInfo &&
          args.before === clientPageInfo.getValue(START_CURSOR)
        ) {
          const nodeIDs = new Set();
          mergeEdges(serverEdges, nextEdges, nodeIDs);
          mergeEdges(prevEdges, nextEdges, nodeIDs);
        } else {
          warning(
            false,
            'RelayConnectionHandler: Unexpected before cursor `%s`, edges must ' +
              'be fetched from the beginning of the list (`%s`).',
            args.before,
            clientPageInfo && clientPageInfo.getValue(START_CURSOR),
          );
          return;
        }
      } else {
        // The connection was refetched from the beginning/end: replace edges
        nextEdges = serverEdges;
      }
    } else if (serverEdges) {
      nextEdges = serverEdges;
    } else {
      nextEdges = prevEdges;
    }
    // Update edges only if they were updated, the null check is
    // for Flow (prevEdges could be null).
    if (nextEdges != null && nextEdges !== prevEdges) {
      connection.setLinkedRecords(nextEdges, EDGES);
    }
    // Page info should be updated even if no new edge were returned.
    if (clientPageInfo && serverPageInfo) {
      if (args.after == null && args.before == null) {
        // The connection was refetched from the beginning/end: replace
        // page_info
        clientPageInfo.copyFieldsFrom(serverPageInfo);
      } else if (args.before != null || (args.after == null && args.last)) {
        clientPageInfo.setValue(
          !!serverPageInfo.getValue(HAS_PREV_PAGE),
          HAS_PREV_PAGE,
        );
        const startCursor = serverPageInfo.getValue(START_CURSOR);
        if (typeof startCursor === 'string') {
          clientPageInfo.setValue(startCursor, START_CURSOR);
        }
      } else if (args.after != null || (args.before == null && args.first)) {
        clientPageInfo.setValue(
          !!serverPageInfo.getValue(HAS_NEXT_PAGE),
          HAS_NEXT_PAGE,
        );
        const endCursor = serverPageInfo.getValue(END_CURSOR);
        if (typeof endCursor === 'string') {
          clientPageInfo.setValue(endCursor, END_CURSOR);
        }
      }
    }
  }
}

/**
 * @public
 *
 * Given a record and the name of the schema field for which a connection was
 * fetched, returns the linked connection record.
 *
 * Example:
 *
 * Given that data has already been fetched on some user `<id>` on the `friends`
 * field:
 *
 * ```
 * fragment FriendsFragment on User {
 *   friends(first: 10) @connection(key: "FriendsFragment_friends") {
 *    edges {
 *      node {
 *        id
 *        }
 *      }
 *   }
 * }
 * ```
 *
 * The `friends` connection record can be accessed with:
 *
 * ```
 * store => {
 *   const user = store.get('<id>');
 *   const friends = RelayConnectionHandler.getConnection(user, 'FriendsFragment_friends');
 *   // Access fields on the connection:
 *   const edges = friends.getLinkedRecords('edges');
 * }
 * ```
 *
 * TODO: t15733312
 * Currently we haven't run into this case yet, but we need to add a `getConnections`
 * that returns an array of the connections under the same `key` regardless of the variables.
 */
function getConnection(
  record: ReadOnlyRecordProxy,
  key: string,
  filters?: ?Variables,
): ?RecordProxy {
  const handleKey = getRelayHandleKey(CONNECTION, key, null);
  return record.getLinkedRecord(handleKey, filters);
}

/**
 * @public
 *
 * Inserts an edge after the given cursor, or at the end of the list if no
 * cursor is provided.
 *
 * Example:
 *
 * Given that data has already been fetched on some user `<id>` on the `friends`
 * field:
 *
 * ```
 * fragment FriendsFragment on User {
 *   friends(first: 10) @connection(key: "FriendsFragment_friends") {
 *    edges {
 *      node {
 *        id
 *        }
 *      }
 *   }
 * }
 * ```
 *
 * An edge can be appended with:
 *
 * ```
 * store => {
 *   const user = store.get('<id>');
 *   const friends = RelayConnectionHandler.getConnection(user, 'FriendsFragment_friends');
 *   const edge = store.create('<edge-id>', 'FriendsEdge');
 *   RelayConnectionHandler.insertEdgeAfter(friends, edge);
 * }
 * ```
 */
function insertEdgeAfter(
  record: RecordProxy,
  newEdge: RecordProxy,
  cursor?: ?string,
): void {
  const {CURSOR, EDGES} = RelayConnectionInterface.get();

  const edges = record.getLinkedRecords(EDGES);
  if (!edges) {
    record.setLinkedRecords([newEdge], EDGES);
    return;
  }
  let nextEdges;
  if (cursor == null) {
    nextEdges = edges.concat(newEdge);
  } else {
    nextEdges = [];
    let foundCursor = false;
    for (let ii = 0; ii < edges.length; ii++) {
      const edge = edges[ii];
      nextEdges.push(edge);
      if (edge == null) {
        continue;
      }
      const edgeCursor = edge.getValue(CURSOR);
      if (cursor === edgeCursor) {
        nextEdges.push(newEdge);
        foundCursor = true;
      }
    }
    if (!foundCursor) {
      nextEdges.push(newEdge);
    }
  }
  record.setLinkedRecords(nextEdges, EDGES);
}

/**
 * @public
 *
 * Creates an edge for a connection record, given a node and edge type.
 */
function createEdge(
  store: RecordSourceProxy,
  record: RecordProxy,
  node: RecordProxy,
  edgeType: string,
): RecordProxy {
  const {NODE} = RelayConnectionInterface.get();

  // An index-based client ID could easily conflict (unless it was
  // auto-incrementing, but there is nowhere to the store the id)
  // Instead, construct a client ID based on the connection ID and node ID,
  // which will only conflict if the same node is added to the same connection
  // twice. This is acceptable since the `insertEdge*` functions ignore
  // duplicates.
  const edgeID = generateClientID(record.getDataID(), node.getDataID());
  let edge = store.get(edgeID);
  if (!edge) {
    edge = store.create(edgeID, edgeType);
  }
  edge.setLinkedRecord(node, NODE);
  return edge;
}

/**
 * @public
 *
 * Inserts an edge before the given cursor, or at the beginning of the list if
 * no cursor is provided.
 *
 * Example:
 *
 * Given that data has already been fetched on some user `<id>` on the `friends`
 * field:
 *
 * ```
 * fragment FriendsFragment on User {
 *   friends(first: 10) @connection(key: "FriendsFragment_friends") {
 *    edges {
 *      node {
 *        id
 *        }
 *      }
 *   }
 * }
 * ```
 *
 * An edge can be prepended with:
 *
 * ```
 * store => {
 *   const user = store.get('<id>');
 *   const friends = RelayConnectionHandler.getConnection(user, 'FriendsFragment_friends');
 *   const edge = store.create('<edge-id>', 'FriendsEdge');
 *   RelayConnectionHandler.insertEdgeBefore(friends, edge);
 * }
 * ```
 */
function insertEdgeBefore(
  record: RecordProxy,
  newEdge: RecordProxy,
  cursor?: ?string,
): void {
  const {CURSOR, EDGES} = RelayConnectionInterface.get();

  const edges = record.getLinkedRecords(EDGES);
  if (!edges) {
    record.setLinkedRecords([newEdge], EDGES);
    return;
  }
  let nextEdges;
  if (cursor == null) {
    nextEdges = [newEdge].concat(edges);
  } else {
    nextEdges = [];
    let foundCursor = false;
    for (let ii = 0; ii < edges.length; ii++) {
      const edge = edges[ii];
      if (edge != null) {
        const edgeCursor = edge.getValue(CURSOR);
        if (cursor === edgeCursor) {
          nextEdges.push(newEdge);
          foundCursor = true;
        }
      }
      nextEdges.push(edge);
    }
    if (!foundCursor) {
      nextEdges.unshift(newEdge);
    }
  }
  record.setLinkedRecords(nextEdges, EDGES);
}

/**
 * @public
 *
 * Remove any edges whose `node.id` matches the given id.
 */
function deleteNode(record: RecordProxy, nodeID: DataID): void {
  const {EDGES, NODE} = RelayConnectionInterface.get();

  const edges = record.getLinkedRecords(EDGES);
  if (!edges) {
    return;
  }
  let nextEdges;
  for (let ii = 0; ii < edges.length; ii++) {
    const edge = edges[ii];
    const node = edge && edge.getLinkedRecord(NODE);
    if (node != null && node.getDataID() === nodeID) {
      if (nextEdges === undefined) {
        nextEdges = edges.slice(0, ii);
      }
    } else if (nextEdges !== undefined) {
      nextEdges.push(edge);
    }
  }
  if (nextEdges !== undefined) {
    record.setLinkedRecords(nextEdges, EDGES);
  }
}

/**
 * @internal
 *
 * Creates a copy of an edge with a unique ID based on per-connection-instance
 * incrementing edge index. This is necessary to avoid collisions between edges,
 * which can occur because (edge) client IDs are assigned deterministically
 * based on the path from the nearest node with an id.
 *
 * Example: if the first N edges of the same connection are refetched, the edges
 * from the second fetch will be assigned the same IDs as the first fetch, even
 * though the nodes they point to may be different (or the same and in different
 * order).
 */
function buildConnectionEdge(
  store: RecordSourceProxy,
  connection: RecordProxy,
  edge: ?RecordProxy,
): ?RecordProxy {
  if (edge == null) {
    return edge;
  }
  const {EDGES} = RelayConnectionInterface.get();

  const edgeIndex = connection.getValue(NEXT_EDGE_INDEX);
  invariant(
    typeof edgeIndex === 'number',
    'RelayConnectionHandler: Expected %s to be a number, got `%s`.',
    NEXT_EDGE_INDEX,
    edgeIndex,
  );
  const edgeID = generateClientID(connection.getDataID(), EDGES, edgeIndex);
  const connectionEdge = store.create(edgeID, edge.getType());
  connectionEdge.copyFieldsFrom(edge);
  connection.setValue(edgeIndex + 1, NEXT_EDGE_INDEX);
  return connectionEdge;
}

/**
 * @internal
 *
 * Adds the source edges to the target edges, skipping edges with
 * duplicate node ids.
 */
function mergeEdges(
  sourceEdges: Array<?RecordProxy>,
  targetEdges: Array<?RecordProxy>,
  nodeIDs: Set<mixed>,
): void {
  const {NODE} = RelayConnectionInterface.get();

  for (let ii = 0; ii < sourceEdges.length; ii++) {
    const edge = sourceEdges[ii];
    if (!edge) {
      continue;
    }
    const node = edge.getLinkedRecord(NODE);
    const nodeID = node && node.getDataID();
    if (nodeID) {
      if (nodeIDs.has(nodeID)) {
        continue;
      }
      nodeIDs.add(nodeID);
    }
    targetEdges.push(edge);
  }
}

module.exports = {
  buildConnectionEdge,
  createEdge,
  deleteNode,
  getConnection,
  insertEdgeAfter,
  insertEdgeBefore,
  update,
};
