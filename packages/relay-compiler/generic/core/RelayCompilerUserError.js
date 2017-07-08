/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayCompilerUserError
 * @flow
 * @format
 */

'use strict';

const createUserError = (format: string, ...args: any): Error => {
  let index = 0;
  const formatted = format.replace(/%s/g, match => args[index++]);
  const err = new Error(formatted);
  (err: any).isRelayUserError = true;
  return err;
};

module.exports = {createUserError};
