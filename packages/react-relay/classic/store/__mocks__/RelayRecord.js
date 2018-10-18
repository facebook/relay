/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const RelayRecord = jest.requireActual('../RelayRecord');

Object.keys(RelayRecord).forEach(name => {
  const method = RelayRecord[name];
  if (typeof method === 'function') {
    RelayRecord[name] = jest.fn(method);
  }
});

module.exports = RelayRecord;
