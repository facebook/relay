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

const filterExclusiveKeys = require('filterExclusiveKeys');

describe('filterExclusiveKeys', () => {
  beforeEach(() => {
    jest.resetModuleRegistry();
  });

  it('computes exclusive keys between two objects with overlap', () => {
    var a = {v: true, w: true, x: true};
    var b = {x: true, y: true, z: true};
    expect(filterExclusiveKeys(a, b)).toEqual([
      ['v', 'w'],
      ['y', 'z'],
    ]);
  });

  it('computes exclusive keys with no first argument', () => {
    var a = null;
    var b = {x: true, y: true, z: true};
    expect(filterExclusiveKeys(a, b)).toEqual([
      [],
      ['x', 'y', 'z'],
    ]);
  });

  it('computes exclusive keys with an empty first argument', () => {
    var a = {};
    var b = {x: true, y: true, z: true};
    expect(filterExclusiveKeys(a, b)).toEqual([
      [],
      ['x', 'y', 'z'],
    ]);
  });

  it('computes exclusive keys with no second argument', () => {
    var a = {x: true, y: true, z: true};
    var b = null;
    expect(filterExclusiveKeys(a, b)).toEqual([
      ['x', 'y', 'z'],
      [],
    ]);
  });

  it('computes exclusive keys with an empty second argument', () => {
    var a = {x: true, y: true, z: true};
    var b = {};
    expect(filterExclusiveKeys(a, b)).toEqual([
      ['x', 'y', 'z'],
      [],
    ]);
  });
});
