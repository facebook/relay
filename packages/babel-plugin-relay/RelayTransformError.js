/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @fullSyntaxTransform
 * @format
 */

'use strict';

import type {Location} from 'graphql';

class RelayTransformError {
  message: string;
  loc: ?Location;
  stack: string;

  constructor(message: string, loc: ?Location) {
    this.message = message;
    this.loc = loc;
    this.stack = new Error().stack;
  }
}

module.exports = RelayTransformError;
