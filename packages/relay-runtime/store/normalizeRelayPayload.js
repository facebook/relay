/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const RelayInMemoryRecordSource = require('./RelayInMemoryRecordSource');
const RelayModernRecord = require('./RelayModernRecord');
const RelayResponseNormalizer = require('./RelayResponseNormalizer');

const {ROOT_ID, ROOT_TYPE} = require('./RelayStoreUtils');

import type {PayloadData, PayloadError} from '../network/RelayNetworkTypes';
import type {NormalizationOptions} from './RelayResponseNormalizer';
import type {RelayResponsePayload, Selector} from './RelayStoreTypes';

function normalizeRelayPayload(
  selector: Selector,
  payload: PayloadData,
  errors: ?Array<PayloadError>,
  options: NormalizationOptions = {handleStrippedNulls: false},
): RelayResponsePayload {
  const source = new RelayInMemoryRecordSource();
  source.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
  const {fieldPayloads, matchPayloads} = RelayResponseNormalizer.normalize(
    source,
    selector,
    payload,
    options,
  );
  return {
    errors,
    fieldPayloads,
    matchPayloads,
    source,
  };
}

module.exports = normalizeRelayPayload;
