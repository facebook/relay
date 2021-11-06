/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const {intern} = require('../StringInterner');

describe('StringInterner', () => {
  it('shortens strings at or past the limit', () => {
    expect(intern('', 0)).toBe('\t1');
    expect(intern('', 0)).toBe('\t1');
    expect(intern('0123456789', 10)).toBe('\t2');
    expect(intern('0123456789', 10)).toBe('\t2');
    expect(intern('0123456789a', 10)).toBe('\t3');
    expect(intern('0123456789a', 10)).toBe('\t3');
  });

  it('escapes or returns strings below the limit', () => {
    expect(intern('test', 5)).toBe('test');
    expect(intern('0123456789', 11)).toBe('0123456789');
    expect(intern('\thello', 10)).toBe('\thello');
    expect(intern('\t0', 10)).toBe('\v\t0');
    expect(intern('\vhello', 10)).toBe('\v\vhello');
  });
});
