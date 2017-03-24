/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const RelayRecord = require.requireActual('RelayRecord');

Object.keys(RelayRecord).forEach(name => {
  const method = RelayRecord[name];
  if (typeof method === 'function') {
    RelayRecord[name] = jest.fn(method);
  }
});

module.exports = RelayRecord;
