/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

const testEditDistance = require('testEditDistance');

describe('testEditDistance()', () => {
  it('considers empty strings to be identical', () => {
    expect(testEditDistance('', '', 0)).toBe(true);
  });

  it('detects non-empty identical strings', () => {
    expect(testEditDistance('foo', 'foo', 0)).toBe(true);
  });

  it('works with one empty and one non-empty string', () => {
    expect(testEditDistance('', 'foo', 2)).toBe(false);
    expect(testEditDistance('', 'foo', 3)).toBe(true);
    expect(testEditDistance('foo', '', 2)).toBe(false);
    expect(testEditDistance('foo', '', 3)).toBe(true);
  });

  it('detects deletions', () => {
    expect(testEditDistance('foobar', 'fbar', 1)).toBe(false);
    expect(testEditDistance('foobar', 'fbar', 2)).toBe(true);
  });

  it('detects insertions', () => {
    expect(testEditDistance('foo', '<foo>', 1)).toBe(false);
    expect(testEditDistance('foo', '<foo>', 2)).toBe(true);
  });

  it('detects substitutions', () => {
    expect(testEditDistance('foobar', 'FooBar', 1)).toBe(false);
    expect(testEditDistance('foobar', 'FooBar', 2)).toBe(true);
  });

  it('detects adjacent transpositions', () => {
    expect(testEditDistance('foobar', 'foboar', 0)).toBe(false);
    expect(testEditDistance('foobar', 'foboar', 1)).toBe(true);
  });

  it('treats non-adjacent transposition as unrelated operations', () => {
    expect(testEditDistance('foobar', 'boofar', 1)).toBe(false);
    expect(testEditDistance('foobar', 'boofar', 2)).toBe(true);
  });

  it('detects distances involving multiple edit operations', () => {
    expect(
      testEditDistance(
        'String involving multiple changes.',
        'strni ginvolvinG mmultiple cangs!',
        7,
      ),
    ).toBe(false);
    expect(
      testEditDistance(
        'String involving multiple changes.',
        'strni ginvolvinG mmultiple cangs!',
        8,
      ),
    ).toBe(true);
  });
});
