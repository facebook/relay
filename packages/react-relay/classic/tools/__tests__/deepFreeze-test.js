/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const deepFreeze = require('../deepFreeze');

describe('deepFreeze()', () => {
  beforeEach(() => {
    expect.extend({
      toBeFrozen(object) {
        const pass = Object.isFrozen(object);
        return {
          pass,
          message: `Expected object ${pass ? 'not ' : ''}to be frozen`,
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
