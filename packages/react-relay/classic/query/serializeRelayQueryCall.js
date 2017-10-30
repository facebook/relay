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

const flattenArray = require('flattenArray');

import type {Call, CallValue} from '../tools/RelayInternalTypes';

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
