/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
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
  const error = new Error(sprintf(format, ...args));
  error.name = name;
  (error: any).type = type;
  (error: any).framesToPop = 2;
  return error;
}

module.exports = RelayError;
