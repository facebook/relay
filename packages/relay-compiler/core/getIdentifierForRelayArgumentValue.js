/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getIdentifierForRelayArgumentValue
 * @flow
 */

'use strict';

const invariant = require('invariant');

import type {ArgumentValue} from 'RelayIR';

/**
 * Generates an identifier for an argument value. The identifier is based on the
 * structure/order of items and keys in the value.
 */
function getIdentifierForRelayArgumentValue(value: ArgumentValue): mixed {
  switch (value.kind) {
    case 'Variable':
      return {variable: value.variableName};
    case 'Literal':
      return {value: value.value};
    case 'ListValue':
      return {list: value.items.map(item => getIdentifierForRelayArgumentValue(item))};
    case 'ObjectValue':
      return {
        object: value.fields.map(field => ({
          name: field.name,
          value: getIdentifierForRelayArgumentValue(field.value),
        })),
      };
    default:
      invariant(
        false,
        'getIdentifierForRelayArgumentValue(): Unsupported AST kind `%s`.',
        value.kind
      );
  }
}

module.exports = getIdentifierForRelayArgumentValue;
