/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule normalizePayload
 * @flow
 * @format
 */

'use strict';

const RelayError = require('RelayError');

const normalizeRelayPayload = require('normalizeRelayPayload');

const {ROOT_ID} = require('RelayStoreUtils');

import type {ConcreteBatch} from 'RelayConcreteNode';
import type {QueryPayload} from 'RelayNetworkTypes';
import type {RelayResponsePayload} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

function normalizePayload(
  operation: ConcreteBatch,
  variables: Variables,
  payload: QueryPayload,
): RelayResponsePayload {
  const {data, errors} = payload;
  if (data != null) {
    return normalizeRelayPayload(
      {
        dataID: ROOT_ID,
        node: operation.query,
        variables: payload.rerunVariables
          ? {...variables, ...payload.rerunVariables}
          : variables,
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
