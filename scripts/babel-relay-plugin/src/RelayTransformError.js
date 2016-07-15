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

class RelayTransformError {
  message: string;
  loc: ?Location;
  stack: string;

  constructor(message: string, loc: ?Location) {
    this.message = message;
    this.loc = loc;
    this.stack = (new Error()).stack;
  }
}

module.exports = RelayTransformError;
