/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

const filterExclusiveKeys = require('../filterExclusiveKeys');

describe('filterExclusiveKeys', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('computes exclusive keys between two objects with overlap', () => {
    const a = {v: true, w: true, x: true};
    const b = {x: true, y: true, z: true};
    expect(filterExclusiveKeys(a, b)).toEqual([['v', 'w'], ['y', 'z']]);
  });

  it('computes exclusive keys with no first argument', () => {
    const a = null;
    const b = {x: true, y: true, z: true};
    expect(filterExclusiveKeys(a, b)).toEqual([[], ['x', 'y', 'z']]);
  });

  it('computes exclusive keys with an empty first argument', () => {
    const a = {};
    const b = {x: true, y: true, z: true};
    expect(filterExclusiveKeys(a, b)).toEqual([[], ['x', 'y', 'z']]);
  });

  it('computes exclusive keys with no second argument', () => {
    const a = {x: true, y: true, z: true};
    const b = null;
    expect(filterExclusiveKeys(a, b)).toEqual([['x', 'y', 'z'], []]);
  });

  it('computes exclusive keys with an empty second argument', () => {
    const a = {x: true, y: true, z: true};
    const b = {};
    expect(filterExclusiveKeys(a, b)).toEqual([['x', 'y', 'z'], []]);
  });
});
