/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule serializeRelayQueryCall
 * @typechecks
 * @flow
 */

'use strict';

import type {
  Call,
  CallValue,
} from 'RelayInternalTypes';

const flattenArray = require('flattenArray');

/**
 * @internal
 *
 * Serializes a query "call" (a legacy combination of field and argument value).
 */
function serializeRelayQueryCall(call: Call): string {
  const {value} = call;
  let valueString;
  if (Array.isArray(value)) {
    valueString = flattenArray(value).map(serializeCallValue).join(',');
  } else {
    valueString = serializeCallValue(value);
  }
  return '.' + call.name + '(' + valueString + ')';
}

function serializeCallValue(value: ?CallValue): string {
  if (value == null) {
    return '';
  } else if (typeof value !== 'string') {
    return JSON.stringify(value);
  } else {
    return value;
  }
}

module.exports = serializeRelayQueryCall;
