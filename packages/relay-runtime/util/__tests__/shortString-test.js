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

const RelayFeatureFlags = require('../RelayFeatureFlags');

const {escape, shorten} = require('../shortString');

beforeEach(() => {
  RelayFeatureFlags.MAX_DATA_ID_LENGTH = 10;
});

describe('shortString', () => {
  it('Escape string works as expected', () => {
    expect(escape('test')).toBe('test');
    expect(escape('123')).toBe('123');
    expect(escape('123test')).toBe('123test');
    expect(escape('i123')).toBe('ni123');
    expect(escape('ni123')).toBe('nni123');
    expect(escape('number')).toBe('nnumber');
  });

  it('Short DataID string works as expected', () => {
    expect(shorten('test')).toBe('test');
    expect(shorten('0123456789')).toBe('i1');
    expect(shorten('0123456789')).toBe('i1');
    expect(shorten('0123456789a')).toBe('i2');
    expect(shorten('i1')).toBe('ni1');
    expect(shorten('ni1')).toBe('nni1');
  });
});
