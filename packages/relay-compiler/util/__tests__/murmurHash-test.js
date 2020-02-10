/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const murmurHash = require('../murmurHash');

test('murmurHash', () => {
  expect(murmurHash('{count: 20, start: 0, end: 5}')).toEqual('31sjku');
  expect(murmurHash('{arg: "{arg: {count: 20, start: 0, end: 5}}"}')).toEqual(
    '3RGiWM',
  );
  expect(
    murmurHash(
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(
        40,
      ),
    ),
  ).toEqual('3OKbT6');
  expect(murmurHash('{}')).toEqual('2wIPj2');
  expect(murmurHash('')).toEqual('0');
});
