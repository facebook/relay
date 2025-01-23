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

import type {GraphQLResponseWithData} from '../network/RelayNetworkTypes';
import type {NormalizationOptions} from './RelayResponseNormalizer';
import type {
  NormalizationSelector,
  RelayResponsePayload,
} from './RelayStoreTypes';

import RelayModernRecord from './RelayModernRecord';
import RelayRecordSource from './RelayRecordSource';
import RelayResponseNormalizer from './RelayResponseNormalizer';

function normalizeResponse(
  response: GraphQLResponseWithData,
  selector: NormalizationSelector,
  typeName: string,
  options: NormalizationOptions,
): RelayResponsePayload {
  const {data, errors} = response;
  const source = RelayRecordSource.create();
  const record = RelayModernRecord.create(selector.dataID, typeName);
  source.set(selector.dataID, record);
  const relayPayload = RelayResponseNormalizer.normalize(
    source,
    selector,
    data,
    options,
    errors,
  );
  return {
    ...relayPayload,
    isFinal: response.extensions?.is_final === true,
  };
}

module.exports = normalizeResponse;
