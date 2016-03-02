/**
 * Copyright (c) 2013-present, Facebook, Inc.
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

const RelayNodeInterface = require('RelayNodeInterface');
const RelayProfiler = require('RelayProfiler');
import type RelayQuery from 'RelayQuery';
const RelayQueryPath = require('RelayQueryPath');
import type RelayQueryWriter from 'RelayQueryWriter';
import type {QueryPayload} from 'RelayInternalTypes';

/**
 * @internal
 *
 * Traverses a query and payload in parallel, writing the results into the
 * store.
 */
function writeRelayQueryPayload(
  writer: RelayQueryWriter,
  query: RelayQuery.Root,
  payload: QueryPayload
): void {
  const store = writer.getRecordStore();
  const recordWriter = writer.getRecordWriter();
  const path = new RelayQueryPath(query);

  RelayNodeInterface.getResultsFromPayload(store, query, payload)
    .forEach(({dataID, result, rootCallInfo}) => {
      if (rootCallInfo) {
        recordWriter.putDataID(
          rootCallInfo.storageKey,
          rootCallInfo.identifyingArgKey,
          dataID
        );
      }
      writer.writePayload(query, dataID, result, path);
    });
}

module.exports = RelayProfiler.instrument(
  'writeRelayQueryPayload',
  writeRelayQueryPayload
);
