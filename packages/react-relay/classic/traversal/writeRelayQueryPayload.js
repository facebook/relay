/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const RelayNodeInterface = require('../interface/RelayNodeInterface');
const RelayQueryPath = require('../query/RelayQueryPath');

const generateClientID = require('../legacy/store/generateClientID');

const {RelayProfiler} = require('RelayRuntime');

import type RelayQuery from '../query/RelayQuery';
import type RelayQueryWriter from '../store/RelayQueryWriter';
import type {QueryPayload} from '../tools/RelayInternalTypes';

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
  payload: QueryPayload,
): void {
  const store = writer.getRecordStore();
  const recordWriter = writer.getRecordWriter();
  const path = RelayQueryPath.create(query);

  RelayNodeInterface.getResultsFromPayload(query, payload).forEach(
    ({result, rootCallInfo}) => {
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

      recordWriter.putDataID(storageKey, identifyingArgKey, dataID);
      writer.writePayload(query, dataID, result, path);
    },
  );
}

module.exports = RelayProfiler.instrument(
  'writeRelayQueryPayload',
  writeRelayQueryPayload,
);
