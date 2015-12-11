/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

const getWeakIdForObject = require('getWeakIdForObject');

describe('getWeakIdForObject', () => {
  beforeEach(() => {
    jest.resetModuleRegistry();
  });

  it('creates persistent IDs for nodes', () => {
    var foo = {};
    var bar = {};
    expect(getWeakIdForObject(foo)).toBe('0');
    expect(getWeakIdForObject(bar)).toBe('1');
    expect(getWeakIdForObject(foo)).toBe('0'); // persistent
    expect(getWeakIdForObject(bar)).toBe('1'); // persistent
  });
});
