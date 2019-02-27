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

const invariant = require('invariant');

const {stableCopy} = require('relay-runtime');

import type {OperationDescriptor} from 'relay-runtime';

/**
 * Returns a stable identifier for a query OperationDescriptor,
 * i.e. for the operation (query) + the variables being used.
 */
function getOperationIdentifier(operation: OperationDescriptor): string {
  const {node, variables} = operation;
  const requestID = node.params.id != null ? node.params.id : node.params.text;
  invariant(
    requestID != null,
    'getOperationIdentifier: Expected operation `%s` to have either a valid `id` or ' +
      '`text` property',
    node.params.name,
  );
  return requestID + JSON.stringify(stableCopy(variables));
}

module.exports = getOperationIdentifier;
