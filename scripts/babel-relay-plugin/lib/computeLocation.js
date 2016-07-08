// @generated
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @fullSyntaxTransform
 */

'use strict';

// Convert a GraphQL location object with relative start/end position in RelayQLDocument in
// source into {line, column, source} information.
function computeLocation(_ref) {
  var start = _ref.start;
  var end = _ref.end;
  var source = _ref.source;

  if (!source) {
    return null;
  }
  var sourceLines = source.body.split('\n');
  var length = 0;
  var line = 0;

  for (; line < sourceLines.length; line++) {
    if (sourceLines[line].length + length >= start) {
      break;
    }
    length += sourceLines[line].length + 1;
  }
  return {
    line: line + 1,
    column: start - length + 1,
    source: sourceLines[line]
  };
}

module.exports = computeLocation;