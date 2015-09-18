/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule transformRelayClientPayload
 * @flow
 * @typechecks
 */

'use strict';

var RelayQuery = require('RelayQuery');

var invariant = require('invariant');
var mapObject = require('mapObject');

type Payload = mixed;

/**
 * Transforms payloads with property keys that match the "application" names
 * (schema names or aliases) into a payload that the server would return for
 * the given query (i.e. using serialization keys instead).
 */
function transformRelayClientPayload(
  node: RelayQuery.Node,
  data: Payload
): Payload {
  if (data == null) {
    return data;
  }
  if (node instanceof RelayQuery.Root) {
    // Handle both FB & OSS formats for root payloads on plural calls: FB
    // returns objects, OSS returns arrays.
    if (Array.isArray(data)) {
      return data.map(item => transform(node, item));
    } else {
      invariant(
        typeof data === 'object',
        'transformClientPayload(): Expected the root payload for query `%s` ' +
        'to be an array or object, got `%s`.',
        node.getName(),
        data
      );
      return mapObject(data, item => transform(node, item));
    }
  }
  return transform(node, data);
}

function transform(
  node: RelayQuery.Node,
  data: Payload
): Payload {
  if (data == null || node.isScalar()) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => transform(node, item));
  }
  invariant(
    typeof data === 'object' && data !== null,
    'transformClientPayload(): Expected data for a non-scalar query node to ' +
    'be null, undefined, an array, or an object. Got `%s`.',
    data
  );
  var payload = data;
  var response = {};
  node.getChildren().forEach(child => {
    if (child instanceof RelayQuery.Field) {
      // Read first from the application name, otherwise from the serialization
      // key, in order to make the function idempotent.
      var serializationKey = child.getSerializationKey();
      response[serializationKey] = transform(
        child,
        payload[child.getApplicationName()] || payload[serializationKey]
      );
    } else {
      invariant(
        child instanceof RelayQuery.Fragment,
        'transformClientPayload(): Unexpected node type.'
      );
      response = {
        ...response,
        ...transform(child, payload),
      };
    }
  });
  return response;
}

module.exports = transformRelayClientPayload;
