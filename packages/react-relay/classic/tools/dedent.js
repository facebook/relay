/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule dedent
 * @flow
 * @format
 */

'use strict';

/**
 * Strips leading indentation from a multi-line string, enabling you to use
 * template literals in tests while maintaining nice nesting.
 *
 * An optional padding string can be supplied to force a fixed indent to be
 * applied back after stripping.
 */
function dedent(string: string, padding: string = ''): string {
  const blankLine = /^\s*$/;
  const lines = string.split('\n');

  // Remove any entirely blank leading or trailing lines.
  if (lines.length && lines[0].match(blankLine)) {
    lines.shift();
  }
  if (lines.length && lines[lines.length - 1].match(blankLine)) {
    lines.pop();
  }

  const minLeadingSpace = lines.reduce((acc, line) => {
    if (line.match(blankLine)) {
      return acc;
    }
    const leadingWhitespace = line.match(/^(\s*)/);
    return Math.min(acc, leadingWhitespace ? leadingWhitespace[1].length : 0);
  }, Infinity);

  return lines
    .map(line => {
      if (line.match(blankLine)) {
        return '';
      }
      return padding + line.slice(minLeadingSpace);
    })
    .join('\n');
}

module.exports = dedent;
