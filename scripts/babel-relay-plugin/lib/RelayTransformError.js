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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RelayTransformError = function RelayTransformError(message, loc) {
  _classCallCheck(this, RelayTransformError);

  this.message = message;
  this.loc = loc;
  this.stack = new Error().stack;
};

module.exports = RelayTransformError;