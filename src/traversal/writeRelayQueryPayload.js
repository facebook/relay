/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule writeRelayQueryPayload
 * @flow
 * @typechecks
 */

'use strict';

var RelayNodeInterface = require('RelayNodeInterface');
var RelayProfiler = require('RelayProfiler');
import type RelayQuery from 'RelayQuery';
var RelayQueryPath = require('RelayQueryPath');
import type RelayQueryWriter from 'RelayQueryWriter';

var invariant = require('invariant');

/**
 * @internal
 *
 * Traverses a query and payload in parallel, writing the results into the
 * store.
 */
function writeRelayQueryPayload(
  writer: RelayQueryWriter,
  query: RelayQuery.Root,
  payload: {[key: string]: mixed}
): void {
  var store = writer.getRecordStore();
  var path = new RelayQueryPath(query);


  RelayNodeInterface.getResultsFromPayload(store, query, payload)
    .forEach(({dataID, result}) => {
      invariant(
        typeof dataID === 'string',
        'writeRelayQueryPayload: expected ID on the payload for query `%s` to be string' +
        ', instead received the `%s` `%s`.',
        path.getName(),
        typeof dataID,
        dataID
      );
      writer.writePayload(query, dataID, result, path);
    });
}

module.exports = RelayProfiler.instrument(
  'writeRelayQueryPayload',
  writeRelayQueryPayload
);
