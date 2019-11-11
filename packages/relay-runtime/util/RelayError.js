/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

/**
 * @private
 */
function createError(type: string, name: string, message: string): Error {
  const error = new Error(message);
  error.name = name;
  (error: $FlowFixMe).type = type;
  (error: $FlowFixMe).framesToPop = 2;
  return error;
}

module.exports = {
  create(name: string, message: string): Error {
    return createError('mustfix', name, message);
  },
  createWarning(name: string, message: string): Error {
    return createError('warn', name, message);
  },
};
