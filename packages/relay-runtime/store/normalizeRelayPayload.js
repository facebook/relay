/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule normalizeRelayPayload
 * @flow
 * @format
 */

'use strict';

const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayModernRecord = require('RelayModernRecord');
const RelayResponseNormalizer = require('RelayResponseNormalizer');

const {ROOT_ID, ROOT_TYPE} = require('RelayStoreUtils');

import type {PayloadData, PayloadError} from 'RelayNetworkTypes';
import type {NormalizationOptions} from 'RelayResponseNormalizer';
import type {RelayResponsePayload, Selector} from 'RelayStoreTypes';

function normalizeRelayPayload(
  selector: Selector,
  payload: PayloadData,
  errors: ?Array<PayloadError>,
  options: NormalizationOptions = {handleStrippedNulls: false},
): RelayResponsePayload {
  const source = new RelayInMemoryRecordSource();
  source.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
  const fieldPayloads = RelayResponseNormalizer.normalize(
    source,
    selector,
    payload,
    options,
  );
  return {
    errors,
    fieldPayloads,
    source,
  };
}

module.exports = normalizeRelayPayload;
