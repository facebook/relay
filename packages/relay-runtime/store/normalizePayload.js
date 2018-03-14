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

const RelayError = require('../util/RelayError');

const normalizeRelayPayload = require('./normalizeRelayPayload');

const {ROOT_ID} = require('./RelayStoreUtils');

import type {ExecutePayload} from '../network/RelayNetworkTypes';
import type {RelayResponsePayload} from './RelayStoreTypes';

function normalizePayload(payload: ExecutePayload): RelayResponsePayload {
  const {operation, variables, response} = payload;
  const {data, errors} = response;
  if (data != null) {
    return normalizeRelayPayload(
      {
        dataID: ROOT_ID,
        node: operation,
        variables,
      },
      data,
      errors,
      {handleStrippedNulls: true},
    );
  }
  const error = RelayError.create(
    'RelayNetwork',
    'No data returned for operation `%s`, got error(s):\n%s\n\nSee the error ' +
      '`source` property for more information.',
    operation.name,
    errors ? errors.map(({message}) => message).join('\n') : '(No errors)',
  );
  (error: any).source = {errors, operation, variables};
  throw error;
}

module.exports = normalizePayload;
