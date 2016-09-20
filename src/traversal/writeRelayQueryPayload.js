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
 */

'use strict';

const RelayNodeInterface = require('RelayNodeInterface');
const RelayProfiler = require('RelayProfiler');
const RelayQueryPath = require('RelayQueryPath');

const generateClientID = require('generateClientID');

import type {QueryPayload} from 'RelayInternalTypes';
import type RelayQuery from 'RelayQuery';
import type RelayQueryWriter from 'RelayQueryWriter';

const {ID} = RelayNodeInterface;

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
  const path = RelayQueryPath.create(query);

  RelayNodeInterface.getResultsFromPayload(query, payload)
    .forEach(({result, rootCallInfo}) => {
      const {storageKey, identifyingArgKey} = rootCallInfo;

      let dataID;
      if (
        typeof result === 'object' &&
        result &&
        typeof result[ID] === 'string'
      ) {
        dataID = result[ID];
      }

      if (dataID == null) {
        dataID =
          store.getDataID(storageKey, identifyingArgKey) || generateClientID();
      }

      recordWriter.putDataID(
        storageKey,
        identifyingArgKey,
        dataID
      );
      writer.writePayload(query, dataID, result, path);
    });
}

module.exports = RelayProfiler.instrument(
  'writeRelayQueryPayload',
  writeRelayQueryPayload
);
