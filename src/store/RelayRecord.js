/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRecord
 * @typechecks
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

type FieldMap = {
  [key: string]: mixed;
};

export type Record = {
  [key: string]: mixed;
  __dataID__: string;
  __filterCalls__?: Array<Call>;
  __forceIndex__?: number;
  __mutationIDs__?: Array<ClientMutationID>;
  __path__?: QueryPath;
  __range__?: GraphQLRange;
  __resolvedDeferredFragments__?: {[fragmentID: string]: boolean};
  __resolvedFragmentMapGeneration__?: number;
  __resolvedFragmentMap__?: {[fragmentID: string]: boolean};
  __status__?: number;
  __typename?: ?string;
};

export type RecordMap = {[key: DataID]: ?Record};

const MetadataKey = {
  DATA_ID: '__dataID__',
  FILTER_CALLS: '__filterCalls__',
  FORCE_INDEX: '__forceIndex__',
  MUTATION_IDS: '__mutationIDs__',
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

  createWithFields(dataID: string, fieldMap: FieldMap): Record {
    return {
      __dataID__: dataID,
      ...fieldMap,
    };
  },

  isRecord(value: mixed): boolean {
    return (
      typeof value === 'object' &&
      value != null &&
      !Array.isArray(value) &&
      typeof value.__dataID__ === 'string'
    );
  },

  getDataID(record: Object): ?string {
    return record.__dataID__;
  },

 /**
  * Checks whether the given ID was created on the client, as opposed to an ID
  * that's understood by the server as well.
  */
  isClientID(dataID: string): boolean {
    return dataID.substring(0, 7) === 'client:';
  },

  isMetadataKey(key: string): boolean {
    return metadataKeyLookup.hasOwnProperty(key);
  },
};

module.exports = RelayRecord;
