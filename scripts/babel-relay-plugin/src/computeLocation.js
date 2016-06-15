/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @fullSyntaxTransform
 */

'use strict';

import type {Location} from 'GraphQLAST';

type RelayQLLocation = {
  line: number,
  column: number,
  source: string,
};

// Convert a GraphQL location object with relative start/end position in RelayQLDocument in
// source into {line, column, source} information.
function computeLocation({start, end, source}: Location): ?RelayQLLocation {
  if (!source) {
    return null;
  }
  const sourceLines = source.body.split('\n');
  let length = 0;
  let line = 0;

  for (; line < sourceLines.length; line++) {
    if (sourceLines[line].length + length >= start) {
      break;
    }
    length += sourceLines[line].length + 1;
  }
  return {
    line: line + 1,
    column: start - length + 1,
    source: sourceLines[line],
  };
}

module.exports = computeLocation;
