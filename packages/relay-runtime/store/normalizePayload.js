/**
 * Copyright (c) Facebook, Inc. and its affiliates.
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

import type {GraphQLResponse} from '../network/RelayNetworkTypes';
import type {RelayResponsePayload, OperationSelector} from './RelayStoreTypes';

function normalizePayload(
  operation: OperationSelector,
  payload: GraphQLResponse,
): RelayResponsePayload {
  const {data, errors} = payload;
  if (data != null) {
    return normalizeRelayPayload(operation.root, data, errors, {
      handleStrippedNulls: true,
    });
  }
  const error = RelayError.create(
    'RelayNetwork',
    'No data returned for operation `%s`, got error(s):\n%s\n\nSee the error ' +
      '`source` property for more information.',
    operation.node.name,
    errors ? errors.map(({message}) => message).join('\n') : '(No errors)',
  );
  (error: any).source = {
    errors,
    operation: operation.node,
    variables: operation.variables,
  };
  throw error;
}

module.exports = normalizePayload;
