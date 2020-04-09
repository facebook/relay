/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const StrictMap = require('../StrictMap');

describe('StrictMap', () => {
  it('should set/get/has value', () => {
    const map = new StrictMap();
    const key = ['key'];
    const value = 'Some value';
    map.set(key, value);
    expect(map.get(key)).toEqual(value);
    expect(map.has(key)).toBe(true);
    expect(map.has('INVALID_KEY')).toBe(false);
  });

  it('should return keys/values/entries', () => {
    const input = [
      ['k1', 'v1'],
      ['k2', 'v2'],
    ];
    const map = new StrictMap(input);
    expect(Array.from(map.keys())).toEqual(['k1', 'k2']);
    expect(Array.from(map.values())).toEqual(['v1', 'v2']);
    expect(Array.from(map.entries())).toEqual(input);
  });

  it('should support forEach callback', () => {
    const test = [];
    const input = [
      ['k1', 'v1'],
      ['k2', 'v2'],
    ];
    const map = new StrictMap(input);
    map.forEach((v, k) => {
      test.push(`${k}:${v}`);
    });
    expect(test).toEqual(['k1:v1', 'k2:v2']);
  });

  test('map', () => {
    const map = new StrictMap([
      ['k1', 'ab'],
      ['k2', 'abc'],
    ]);
    const mapped = map.map(str => str.length);
    expect(Array.from(mapped.entries())).toEqual([
      ['k1', 2],
      ['k2', 3],
    ]);
  });

  test('asyncMap', async () => {
    const map = new StrictMap([
      ['k1', 'ab'],
      ['k2', 'abc'],
    ]);
    const mapped = await map.asyncMap(str => Promise.resolve(str.length));
    expect(Array.from(mapped.entries())).toEqual([
      ['k1', 2],
      ['k2', 3],
    ]);
  });
});
