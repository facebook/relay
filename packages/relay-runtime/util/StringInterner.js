/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const internTable = new Map();
let nextIndex = 1;
const digits = initDigitTable();

// Character used as the prefix for interned strings. The specific character is
// chosen to reduce the likelihood that non-interned input strings need to be
// escaped (choosing eg a-Z would increase the likelihood we need to escape)
const INTERN_PREFIX = '\t';
// Character used as the prefix of escaped strings. As above, this is also
// chosen to be unlikely in normal input strings.
const ESCAPE_PREFIX = '\v';

function initDigitTable() {
  // disable lint because digits isn't defined when this function is called
  // eslint-disable-next-line no-shadow
  const digits = new Set();
  for (let i = 0; i < 10; ++i) {
    digits.add(i.toString());
  }
  return digits;
}

// Escape a string so that it cannot conflict with an interned string
function escape(str: string): string {
  if (
    // "\t<digit>..." -> "\v\t<digit>..."
    (str[0] === INTERN_PREFIX && digits.has(str[1])) ||
    // "\v..." -> "\v\v..."
    str[0] === ESCAPE_PREFIX
  ) {
    return ESCAPE_PREFIX + str;
  }
  return str;
}

// Interns the input string if its length equals or exceeds the given `limit`,
// returning a shorter replacement string that is uniquely associated with the
// input: multiple calls to intern() for the equivalent input strings (and limit)
// will always return the exact same string.
// Strings shorter than the limit are not interned but are escaped if they
// could conflict with interned strings.
function intern(str: string, limit: ?number): string {
  if (limit == null || str.length < limit) {
    return escape(str);
  }
  let internedString = internTable.get(str);
  if (internedString != null) {
    return internedString;
  }
  internedString = INTERN_PREFIX + nextIndex++;
  internTable.set(str, internedString);
  return internedString;
}

module.exports = {intern};
