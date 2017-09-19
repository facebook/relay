/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayError
 * @flow
 * @format
 */

'use strict';

const sprintf = require('sprintf');

/**
 * @internal
 *
 * Factory methods for constructing errors in Relay.
 */
const RelayError = {
  create(name: string, format: string, ...args: Array<mixed>): Error {
    return createError('mustfix', name, format, args);
  },
  createWarning(name: string, format: string, ...args: Array<mixed>): Error {
    return createError('warn', name, format, args);
  },
};

/**
 * @private
 */
function createError(
  type: string,
  name: string,
  format: string,
  args: Array<mixed>,
): Error {
  /*eslint-disable fb-www/sprintf-like-args */
  const error = new Error(sprintf(format, ...args));
  /*eslint-enable fb-www/sprintf-like-args */
  error.name = name;
  (error: any).type = type;
  (error: any).framesToPop = 2;
  return error;
}

module.exports = RelayError;
