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

const ConnectionHandler = require('./ConnectionHandler');

const invariant = require('invariant');
const warning = require('warning');

import type {
  RecordProxy,
  HandleFieldPayload,
  RecordSourceProxy,
  Handler,
} from '../../store/RelayStoreTypes';

const DeleteRecordHandler = {
  update: (store: RecordSourceProxy, payload: HandleFieldPayload) => {
    const record = store.get(payload.dataID);
    if (record != null) {
      const id = record.getValue(payload.fieldKey);
      if (typeof id === 'string') {
        store.delete(id);
      }
    }
  },
};

const AppendEdgeHandler: Handler = {
  update: edgeUpdater(ConnectionHandler.insertEdgeAfter),
};

const PrependEdgeHandler: Handler = {
  update: edgeUpdater(ConnectionHandler.insertEdgeBefore),
};

function edgeUpdater(
  insertFn: (RecordProxy, RecordProxy, ?string) => void,
): (RecordSourceProxy, HandleFieldPayload) => void {
  return (store: RecordSourceProxy, payload: HandleFieldPayload) => {
    const record = store.get(payload.dataID);
    if (record == null) {
      return;
    }
    const {connections} = payload.handleArgs;
    invariant(
      connections != null,
      'MutationHandlers: Expected connection IDs to be specified.',
    );
    const serverEdge = record.getLinkedRecord(payload.fieldKey, payload.args);
    for (const connectionID of connections) {
      const connection = store.get(connectionID);
      if (connection == null) {
        warning(
          false,
          `[Relay][Mutation] The connection with id '${connectionID}' doesn't exist.`,
        );
        continue;
      }
      const clientEdge = ConnectionHandler.buildConnectionEdge(
        store,
        connection,
        serverEdge,
      );
      invariant(
        clientEdge != null,
        'MutationHandlers: Failed to build the edge.',
      );
      insertFn(connection, clientEdge);
    }
  };
}

module.exports = {
  AppendEdgeHandler,
  DeleteRecordHandler,
  PrependEdgeHandler,
};
