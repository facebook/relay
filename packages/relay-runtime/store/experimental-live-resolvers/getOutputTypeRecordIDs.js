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

import type {DataID} from '../../util/RelayRuntimeTypes';
import type {Record} from '../RelayStoreTypes';

const RelayModernRecord = require('../RelayModernRecord');
const {RELAY_RESOLVER_OUTPUT_TYPE_RECORD_IDS} = require('../RelayStoreUtils');
const invariant = require('invariant');

function getOutputTypeRecordIDs(record: Record): $ReadOnlySet<DataID> | null {
  const maybeOutputTypeRecordIDs = RelayModernRecord.getValue(
    record,
    RELAY_RESOLVER_OUTPUT_TYPE_RECORD_IDS,
  );
  if (maybeOutputTypeRecordIDs == null) {
    return null;
  }
  invariant(
    maybeOutputTypeRecordIDs instanceof Set,
    'getOutputTypeRecordIDs: Expected the `%s` field on record `%s` to be of type Set. Instead, it is a %s.',
    RELAY_RESOLVER_OUTPUT_TYPE_RECORD_IDS,
    typeof maybeOutputTypeRecordIDs,
  );

  return maybeOutputTypeRecordIDs;
}

module.exports = getOutputTypeRecordIDs;
