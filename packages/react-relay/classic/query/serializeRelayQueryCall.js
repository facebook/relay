/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule serializeRelayQueryCall
 * @flow
 */

'use strict';

const flattenArray = require('flattenArray');

import type {
  Call,
  CallValue,
} from 'RelayInternalTypes';

/**
 * @internal
 *
 * Serializes a query "call" (a classic combination of field and argument value).
 */
function serializeRelayQueryCall(call: Call): string {
  const {value} = call;
  let valueString;
  if (Array.isArray(value)) {
    valueString = flattenArray(value)
      .map(value => serializeCallValue((value: any)))
      .join(',');
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
