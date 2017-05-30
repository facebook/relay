/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule transformRelayQueryPayload
 * @flow
 * @format
 */

'use strict';

const RelayQuery = require('RelayQuery');
const RelayQueryVisitor = require('RelayQueryVisitor');

const invariant = require('invariant');
const mapObject = require('mapObject');

import type {QueryPayload} from 'RelayInternalTypes';

type PayloadState = {
  client: QueryPayload,
  server: QueryPayload,
};
type TransformConfig = {
  getKeyForClientData: (field: RelayQuery.Field) => string,
  traverseChildren: (
    node: RelayQuery.Node,
    callback: (
      child: RelayQuery.Node,
      index: number,
      children: Array<RelayQuery.Node>,
    ) => void,
    context: any,
  ) => void,
};

/**
 * Transforms "client" payloads with property keys that match the "application"
 * names (i.e. property names are schema names or aliases) into "server"
 * payloads that match what the server would return for the given query (i.e.
 * property names are serialization keys instead).
 */
function transformRelayQueryPayload(
  root: RelayQuery.Root,
  clientData: QueryPayload,
  config?: TransformConfig,
): QueryPayload {
  if (clientData == null) {
    return clientData;
  } else {
    return mapObject(clientData, item => {
      // Handle both FB & OSS formats for root payloads on plural calls: FB
      // returns objects, OSS returns arrays.
      if (Array.isArray(item)) {
        return item.map(innerItem => transform(root, innerItem, config));
      }
      return transform(root, item, config);
    });
  }
}

function transform(
  root: RelayQuery.Root,
  clientData: QueryPayload,
  config: ?TransformConfig,
): QueryPayload {
  if (clientData == null) {
    return clientData;
  }
  const transformer = new RelayPayloadTransformer(config);
  const serverData = {};
  transformer.visit(root, {
    client: clientData,
    server: serverData,
  });
  return serverData;
}

class RelayPayloadTransformer extends RelayQueryVisitor<PayloadState> {
  _getKeyForClientData: (field: RelayQuery.Field) => string;
  _traverseChildren: ?(
    node: RelayQuery.Node,
    callback: (
      child: RelayQuery.Node,
      index: number,
      children: Array<RelayQuery.Node>,
    ) => void,
    context: any,
  ) => void;

  constructor(config: ?TransformConfig) {
    super();
    if (config) {
      this._getKeyForClientData = config.getKeyForClientData;
      this._traverseChildren = config.traverseChildren;
    }
  }

  _getKeyForClientData(field: RelayQuery.Field): string {
    return field.getApplicationName();
  }

  traverseChildren(
    node: RelayQuery.Node,
    nextState: PayloadState,
    callback: (
      child: RelayQuery.Node,
      index: number,
      children: Array<RelayQuery.Node>,
    ) => void,
    context: any,
  ): void {
    if (this._traverseChildren) {
      this._traverseChildren(node, callback, context);
    } else {
      super.traverseChildren(node, nextState, callback, context);
    }
  }

  visitField(node: RelayQuery.Field, state: PayloadState): void {
    const {client, server} = state;
    const applicationName = this._getKeyForClientData(node);
    const serializationKey = node.getSerializationKey();
    const clientData = client[applicationName];
    let serverData = server[serializationKey];

    if (!client.hasOwnProperty(applicationName)) {
      return;
    } else if (!node.canHaveSubselections() || clientData == null) {
      server[serializationKey] = clientData;
    } else if (Array.isArray(clientData)) {
      if (serverData == null) {
        server[serializationKey] = serverData = [];
      }
      clientData.forEach((clientItem, index) => {
        invariant(
          Array.isArray(serverData),
          'RelayPayloadTransformer: Got conflicting values for field `%s`: ' +
            'expected values to be arrays.',
          applicationName,
        );
        if (clientItem == null) {
          serverData[index] = clientItem;
          return;
        }
        let serverItem = serverData && serverData[index];
        if (serverItem == null) {
          serverData[index] = serverItem = {};
        }
        /* $FlowFixMe - Flow error detected during the deployment of v0.38.0. To
         * see the error, remove this comment and run flow */
        this.traverse(node, {
          client: clientItem,
          server: serverItem,
        });
      });
    } else {
      invariant(
        typeof clientData === 'object' && clientData !== null,
        'RelayPayloadTransformer: Expected an object value for field `%s`.',
        applicationName,
      );
      invariant(
        serverData == null || typeof serverData === 'object',
        'RelayPayloadTransformer: Got conflicting values for field `%s`: ' +
          'expected values to be objects.',
        applicationName,
      );
      if (serverData == null) {
        server[serializationKey] = serverData = {};
      }
      this.traverse(node, {
        client: clientData,
        server: serverData,
      });
    }
  }
}

module.exports = transformRelayQueryPayload;
