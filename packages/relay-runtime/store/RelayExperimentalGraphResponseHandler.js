/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow
 * @format
 */

import type {
  DataChunk,
  GraphModeResponse,
  RecordChunk,
} from './RelayExperimentalGraphResponseTransform';
import type {MutableRecordSource, Record} from './RelayStoreTypes';

const RelayModernRecord = require('./RelayModernRecord');
const invariant = require('invariant');

/**
 * Given a stream of GraphMode chunks, populate a MutableRecordSource.
 */
export function handleGraphModeResponse(
  recordSource: MutableRecordSource,
  response: GraphModeResponse,
): MutableRecordSource {
  const handler = new GraphModeHandler(recordSource);
  return handler.populateRecordSource(response);
}

class GraphModeHandler {
  _recordSource: MutableRecordSource;
  _streamIdToCacheKey: Map<number, string>;
  constructor(recordSource: MutableRecordSource) {
    this._recordSource = recordSource;
    this._streamIdToCacheKey = new Map();
  }
  populateRecordSource(response: GraphModeResponse): MutableRecordSource {
    for (const chunk of response) {
      switch (chunk.$kind) {
        case 'Record':
          this._handleRecordChunk(chunk);
          break;
        case 'Extend': {
          const cacheKey = this._lookupCacheKey(chunk.$streamID);
          const record = this._recordSource.get(cacheKey);
          invariant(
            record != null,
            `Expected to have a record for cache key ${cacheKey}`,
          );
          this._populateRecord(record, chunk);
          break;
        }
        case 'Complete':
          this._streamIdToCacheKey.clear();
          break;
        default:
          (chunk.$kind: empty);
      }
    }
    return this._recordSource;
  }

  _handleRecordChunk(chunk: RecordChunk) {
    const cacheKey = chunk.__id;
    let record = this._recordSource.get(cacheKey);
    if (record == null) {
      record = RelayModernRecord.create(cacheKey, chunk.__typename);
      this._recordSource.set(cacheKey, record);
    }

    this._streamIdToCacheKey.set(chunk.$streamID, cacheKey);
    this._populateRecord(record, chunk);
  }

  _populateRecord(parentRecord: Record, chunk: DataChunk) {
    for (const [key, value] of Object.entries(chunk)) {
      switch (key) {
        case '$streamID':
        case '$kind':
        case '__typename':
          break;
        default:
          if (
            typeof value !== 'object' ||
            value == null ||
            Array.isArray(value)
          ) {
            RelayModernRecord.setValue(parentRecord, key, value);
          } else {
            if (value.hasOwnProperty('__id')) {
              // Singular
              const streamID = ((value.__id: any): number);
              const id = this._lookupCacheKey(streamID);
              RelayModernRecord.setLinkedRecordID(parentRecord, key, id);
            } else if (value.hasOwnProperty('__ids')) {
              // Plural
              const streamIDs = ((value.__ids: any): Array<number | null>);
              const ids = streamIDs.map(sID => {
                return sID == null ? null : this._lookupCacheKey(sID);
              });
              RelayModernRecord.setLinkedRecordIDs(parentRecord, key, ids);
            } else {
              invariant(false, 'Expected object to have either __id or __ids.');
            }
          }
      }
    }
  }

  _lookupCacheKey(streamID: number): string {
    const cacheKey = this._streamIdToCacheKey.get(streamID);
    invariant(
      cacheKey != null,
      `Expected to have a cacheKey for $streamID ${streamID}`,
    );
    return cacheKey;
  }
}
