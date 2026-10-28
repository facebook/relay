/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {DataID} from '../util/RelayRuntimeTypes';

const RelayFeatureFlags = require('../util/RelayFeatureFlags');

const PREFIX = 'client:__type:';
const TYPE_SCHEMA_TYPE = '__TypeSchema';

function generateTypeID(typeName: string): DataID {
  if (RelayFeatureFlags.ENABLE_PERF_STORAGE_KEYS) {
    return generateTypeIDPerf(typeName);
  }
  return PREFIX + typeName;
}

function isTypeID(id: DataID): boolean {
  return id.indexOf(PREFIX) === 0;
}

// ----------------------------------------------------------------------
// Optimized variants (`*Perf`) of the functions above.
// Used only when ENABLE_PERF_STORAGE_KEYS is on; with it off the code above runs
// unchanged.

// One string per type name (as many entries as types in the schema).
const typeIDs: Map<string, DataID> = new Map();

function generateTypeIDPerf(typeName: string): DataID {
  let typeID = typeIDs.get(typeName);
  if (typeID === undefined) {
    typeID = PREFIX + typeName;
    typeIDs.set(typeName, typeID);
  }
  return typeID;
}

module.exports = {generateTypeID, isTypeID, TYPE_SCHEMA_TYPE};
