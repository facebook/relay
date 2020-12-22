/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

function removeNulls(value: mixed) {
  if (value == null || typeof value !== 'object') {
    return;
  }
  for (const k in value) {
    if (value[k] === null || value[k] === false) {
      // $FlowFixMe[cannot-write]
      Array.isArray(value) ? value.slice(k, 1) : delete value[k];
    } else if (typeof value[k] == 'object') {
      removeNulls(value[k]);
    }
  }
}

module.exports = removeNulls;
