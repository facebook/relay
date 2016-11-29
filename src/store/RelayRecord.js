/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRecord
 * @flow
 */

'use strict';

import type GraphQLRange from 'GraphQLRange';
import type {
  Call,
  ClientMutationID,
  DataID,
} from 'RelayInternalTypes';
import type {QueryPath} from 'RelayQueryPath';

export type Record = {
  /* $FlowFixMe(>=0.36.0) Flow error detected during the
   * deploy of Flow v0.36.0. To see the error, remove this comment and run Flow
   */
  [key: string]: mixed;
  __dataID__: string,
  __filterCalls__?: Array<Call>,
  __forceIndex__?: number,
  __mutationIDs__?: Array<ClientMutationID>,
  __mutationStatus__?: string,
  __path__?: QueryPath,
  __range__?: GraphQLRange,
  __resolvedDeferredFragments__?: {[fragmentID: string]: boolean},
  __resolvedFragmentMapGeneration__?: number,
  __resolvedFragmentMap__?: {[fragmentID: string]: boolean},
  __status__?: number,
  __typename?: ?string,
};
export type RecordMap = {[key: DataID]: ?Record};

const MetadataKey = {
  DATA_ID: '__dataID__',
  FILTER_CALLS: '__filterCalls__',
  FORCE_INDEX: '__forceIndex__',
  MUTATION_IDS: '__mutationIDs__',
  MUTATION_STATUS: '__mutationStatus__',
  PATH: '__path__',
  RANGE: '__range__',
  RESOLVED_DEFERRED_FRAGMENTS: '__resolvedDeferredFragments__',
  RESOLVED_FRAGMENT_MAP: '__resolvedFragmentMap__',
  RESOLVED_FRAGMENT_MAP_GENERATION: '__resolvedFragmentMapGeneration__',
  STATUS: '__status__',
};

const metadataKeyLookup = {};
Object.keys(MetadataKey).forEach(name => {
  metadataKeyLookup[MetadataKey[name]] = true;
});

/**
 * Records are plain objects with special metadata properties.
 */
const RelayRecord = {

  MetadataKey,

  create(dataID: string): Record {
    return {__dataID__: dataID};
  },

  createWithFields<Fields: Object>(
    dataID: string,
    fields: Fields
  ): Record & Fields {
    return {__dataID__: dataID, ...fields};
  },

  isRecord(maybeRecord: mixed): boolean {
    return (
      typeof maybeRecord === 'object' &&
      maybeRecord != null &&
      !Array.isArray(maybeRecord) &&
      typeof maybeRecord.__dataID__ === 'string'
    );
  },

  getRecord(maybeRecord: mixed): ?Record {
    if (RelayRecord.isRecord(maybeRecord)) {
      return (maybeRecord: any);
    } else {
      return null;
    }
  },

  getDataID(record: Record): string {
    return record.__dataID__;
  },

  getDataIDForObject(maybeRecord: Object): ?string {
    return maybeRecord.__dataID__;
  },

 /**
  * Checks whether the given ID was created on the client, as opposed to an ID
  * that's understood by the server as well.
  */
  isClientID(dataID: string): boolean {
    return dataID.startsWith('client:');
  },

  isMetadataKey(key: string): boolean {
    return metadataKeyLookup.hasOwnProperty(key);
  },
};

module.exports = RelayRecord;
