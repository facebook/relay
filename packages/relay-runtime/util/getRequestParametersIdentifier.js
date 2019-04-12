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
const stableCopy = require('./stableCopy');

import type {RequestParameters} from './RelayConcreteNode';
import type {Variables} from './RelayRuntimeTypes';

export opaque type Identifier: string = string;

/**
 * Returns a stable identifier for the given pair of `RequestParameters` +
 * variables.
 */
function getRequestParametersIdentifier(
  parameters: RequestParameters,
  variables: Variables,
): Identifier {
  const requestID = parameters.id != null ? parameters.id : parameters.text;
  invariant(
    requestID != null,
    'getRequestParametersIdentifier: Expected request `%s` to have either a ' +
      'valid `id` or `text` property',
    parameters.name,
  );
  return requestID + JSON.stringify(stableCopy(variables));
}

module.exports = getRequestParametersIdentifier;
