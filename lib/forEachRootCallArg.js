/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule forEachRootCallArg
 * @typechecks
 * 
 */

'use strict';

var invariant = require('fbjs/lib/invariant');

/**
 * @internal
 *
 * Iterates over the identifying arguments in the supplied root call.
 * If the identifying value is null or undefined, the supplied callback will be
 * invoked once.
 */
function forEachRootCallArg(query, callback) {
  !!query.getBatchCall() ? process.env.NODE_ENV !== 'production' ? invariant(false, 'forEachRootCallArg(): Cannot iterate over batch call variables.') : invariant(false) : undefined;
  function each(identifyingArgValue, fn) {
    if (Array.isArray(identifyingArgValue)) {
      identifyingArgValue.forEach(function (value) {
        return each(value, fn);
      });
    } else if (identifyingArgValue == null) {
      fn(identifyingArgValue);
    } else {
      !(typeof identifyingArgValue === 'string' || typeof identifyingArgValue === 'number') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Relay: Expected arguments to root field `%s` to each be strings/' + 'numbers, got `%s`.', query.getFieldName(), JSON.stringify(identifyingArgValue)) : invariant(false) : undefined;
      fn('' + identifyingArgValue);
    }
  }
  var identifyingArg = query.getIdentifyingArg();
  var identifyingArgValue = identifyingArg && identifyingArg.value || null;
  each(identifyingArgValue, callback);
}

module.exports = forEachRootCallArg;