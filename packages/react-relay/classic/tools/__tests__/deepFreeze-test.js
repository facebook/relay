/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 */

'use strict';

jest.autoMockOff();

const deepFreeze = require('deepFreeze');

describe('deepFreeze()', () => {
  beforeEach(() => {
    jest.addMatchers({
      toBeFrozen() {
        return {
          compare(object) {
            const pass = Object.isFrozen(object);
            return {
              pass,
              message: `Expected object ${pass ? 'not ' : ''}to be frozen`,
            };
          },
        };
      },
    });
  });

  it('freezes a simple object', () => {
    const object = deepFreeze({a: 1});
    expect(object).toBeFrozen();
  });

  it('freezes nested objects', () => {
    const object = deepFreeze({a: 1, b: {c: 2}});
    expect(object).toBeFrozen();
    expect(object.b).toBeFrozen();
  });

  it('short-circuits given a circular reference', () => {
    const object = {a: 1, b: {c: 2}};
    object.b.d = object;
    deepFreeze(object);
    expect(object).toBeFrozen();
    expect(object.b).toBeFrozen();
  });

  it('returns the original object', () => {
    const object = {a: 1, b: {c: 2}};
    const frozen = deepFreeze(object);
    expect(frozen).toBe(object);
  });

  it('copes with null values', () => {
    expect(deepFreeze({a: null})).toBeFrozen();
  });
});
