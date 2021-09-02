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

const RelayFeatureFlags = require('./RelayFeatureFlags');

/**
 * Convert a long string into a unique short string
 */
const ids = Object.create(null);
const digits = initDigitTable();
let seq = 1;
const ESCAPE_PREFIX = 'n';
const INTERN_PREFIX = 'i';

function initDigitTable() {
  const ret = Object.create(null);
  for (let i = 0; i < 10; ++i) {
    ret[`${i}`] = true;
  }
  return ret;
}

// escape a string so that it never conflicts with a shortened string
function escape(str: string): string {
  if (
    // "i<digit>..." -> "ni<digit>..."
    (str[0] === INTERN_PREFIX && str[1] in digits) ||
    // "ni<digit>..." -> "nni<digit>"
    str[0] === ESCAPE_PREFIX
  ) {
    return ESCAPE_PREFIX + str;
  }
  return str;
}

function shorten(str: string): string {
  if (
    RelayFeatureFlags.MAX_DATA_ID_LENGTH == null ||
    str.length < RelayFeatureFlags.MAX_DATA_ID_LENGTH
  ) {
    return escape(str);
  }
  if (str in ids) {
    return ids[str];
  }
  const ret = INTERN_PREFIX + seq++;
  ids[str] = ret;
  return ret;
}

module.exports = {escape, shorten};
