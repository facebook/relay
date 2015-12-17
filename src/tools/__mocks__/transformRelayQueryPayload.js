/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule transformRelayQueryPayload
 * @flow
 * @typechecks
 */

'use strict';

const RelayQuery = require('RelayQuery');
const RelayQueryVisitor = require('RelayQueryVisitor');

const invariant = require('invariant');
const mapObject = require('mapObject');

type Payload = mixed;
type PayloadState = {
  client: Payload,
  server: Payload,
};

/**
 * Transforms "client" payloads with property keys that match the "application"
 * names (i.e. property names are schema names or aliases) into "server"
 * payloads that match what the server would return for the given query (i.e.
 * property names are serialization keys instead).
 */
function transformRelayQueryPayload(
  root: RelayQuery.Root,
  clientData: Payload
): Payload {
  // Handle both FB & OSS formats for root payloads on plural calls: FB
  // returns objects with array values, OSS returns arrays.
  if (clientData == null) {
    return clientData;
  } else if (Array.isArray(clientData)) {
    return clientData.map(item => transform(root, item));
  } else {
    invariant(
      typeof clientData === 'object',
      'transformClientPayload(): Expected the root payload for query `%s` ' +
      'to be an array or object, got `%s`.',
      root.getName(),
      clientData
    );
    return mapObject(clientData, item => {
      if (Array.isArray(item)) {
        return item.map(innerItem => transform(root, innerItem));
      }
      return transform(root, item);
    });
  }
}

function transform(
  root: RelayQuery.Root,
  clientData: Payload
): Payload {
  if (clientData == null) {
    return clientData;
  }
  var transform = new RelayPayloadTransformer();
  var serverData = {};
  transform.visit(root, {
    client: clientData,
    server: serverData,
  });
  return serverData;
}

class RelayPayloadTransformer extends RelayQueryVisitor<PayloadState> {
  visitField(
    node: RelayQuery.Field,
    state: PayloadState
  ): void {
    var {client, server} = state;
    // `client` represents the *parent* node value and should not be null
    // due to checks before traversing child values.
    invariant(
      typeof client === 'object' && client !== null,
      'RelayPayloadTransformer: Expected a client value for field `%s`.',
      node.getApplicationName()
    );
    invariant(
      typeof server === 'object' && server !== null,
      'RelayPayloadTransformer: Expected a server value for field `%s`.',
      node.getApplicationName()
    );
    var applicationName = node.getApplicationName();
    var serializationKey = node.getSerializationKey();
    var clientData = client[applicationName];
    var serverData = server[serializationKey];

    if (node.isScalar() || clientData == null) {
      server[serializationKey] = clientData;
    } else if (Array.isArray(clientData)) {
      invariant(
        serverData == null || Array.isArray(serverData),
        'RelayPayloadTransformer: Got conflicting values for field `%s`: ' +
        'expected values to be arrays.',
        applicationName
      );
      if (serverData == null) {
        server[serializationKey] = serverData = [];
      }
      clientData.forEach((clientItem, index) => {
        if (clientItem == null) {
          serverData[index] = clientItem;
          return;
        }
        var serverItem = serverData && serverData[index];
        if (serverItem == null) {
          serverData[index] = serverItem = {};
        }
        this.traverse(node, {
          client: clientItem,
          server: serverItem,
        });
      });
    } else {
      invariant(
        typeof clientData === 'object' && clientData !== null,
        'RelayPayloadTransformer: Expected an object value for field `%s`.',
        applicationName
      );
      invariant(
        serverData == null || typeof serverData === 'object',
        'RelayPayloadTransformer: Got conflicting values for field `%s`: ' +
        'expected values to be objects.',
        applicationName
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
