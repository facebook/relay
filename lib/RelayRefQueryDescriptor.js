/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRefQueryDescriptor
 * 
 * @typechecks
 */

'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

/**
 * @internal
 *
 * Represents a node that will eventually become a "ref query".
 *
 * Includes the `nodePath` (ancestor nodes) that can be used to construct an
 * appropriate the JSONPath for the query.
 *
 * @see splitDeferredRelayQueries
 */

var RelayRefQueryDescriptor = function RelayRefQueryDescriptor(node, nodePath) {
  _classCallCheck(this, RelayRefQueryDescriptor);

  this.node = node;
  this.nodePath = nodePath;
};

module.exports = RelayRefQueryDescriptor;