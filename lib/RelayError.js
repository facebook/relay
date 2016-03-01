/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayError
 * @typechecks
 * 
 */

'use strict';

var sprintf = require('fbjs/lib/sprintf');

/**
 * @internal
 *
 * Factory methods for constructing errors in Relay.
 */
var RelayError = {
  create: function create(name, format) {
    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    return createError('mustfix', name, format, args);
  },
  createWarning: function createWarning(name, format) {
    for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      args[_key2 - 2] = arguments[_key2];
    }

    return createError('warn', name, format, args);
  }
};

/**
 * @private
 */
function createError(type, name, format, args) {
  /*eslint-disable fb-www/sprintf-like-args */
  var error = new Error(sprintf.apply(undefined, [format].concat(args)));
  /*eslint-enable fb-www/sprintf-like-args */
  error.name = name;
  error.type = type;
  error.framesToPop = 2;
  return error;
}

module.exports = RelayError;