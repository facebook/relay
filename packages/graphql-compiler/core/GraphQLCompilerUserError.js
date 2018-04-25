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

const createUserError = (format: string, ...args: any): Error => {
  let index = 0;
  const formatted = format.replace(/%s/g, match => args[index++]);
  return new Error(formatted);
};

module.exports = {createUserError};
