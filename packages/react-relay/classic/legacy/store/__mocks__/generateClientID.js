/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

let count = 1;

const generateClientID = jest.fn(() => {
  return 'client:' + count++;
});

module.exports = generateClientID;
