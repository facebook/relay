/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import type {DataID} from '../util/RelayRuntimeTypes';

const RelayFeatureFlags = require('../util/RelayFeatureFlags');
const {intern} = require('../util/StringInterner');

const PREFIX = 'client:';

function generateClientID(
  id: DataID,
  storageKey: string,
  index?: number,
): DataID {
  const internedId =
    RelayFeatureFlags.STRING_INTERN_LEVEL <= 0
      ? id
      : intern(id, RelayFeatureFlags.MAX_DATA_ID_LENGTH);
  let key = internedId + ':' + storageKey;
  if (index != null) {
    key += ':' + index;
  }
  if (key.indexOf(PREFIX) !== 0) {
    key = PREFIX + key;
  }
  return key;
}

function isClientID(id: DataID): boolean {
  return id.indexOf(PREFIX) === 0;
}

let localID: number = 0;
function generateUniqueClientID(): DataID {
  return `${PREFIX}local:${localID++}`;
}

// Client objects backed by Relay Resolvers may not be able to provide a
// globally unique ID, so we provide a namespace.
function generateClientObjectClientID(
  typename: string,
  localId: string,
): DataID {
  return `${PREFIX}${typename}:${localId}`;
}

module.exports = {
  generateClientID,
  generateClientObjectClientID,
  generateUniqueClientID,
  isClientID,
};
