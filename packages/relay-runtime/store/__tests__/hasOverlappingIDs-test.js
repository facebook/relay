/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const hasOverlappingIDs = require('../hasOverlappingIDs');

test('with overlap', () => {
  expect(
    hasOverlappingIDs(
      {
        one: null,
        two: null,
        three: null,
      },
      {
        two: true,
      },
    ),
  ).toBe(true);
});

test('no overlap', () => {
  expect(
    hasOverlappingIDs(
      {
        one: null,
        two: null,
        three: null,
      },
      {
        four: true,
      },
    ),
  ).toBe(false);
});

test('special keys', () => {
  expect(
    hasOverlappingIDs(
      {
        hasOwnProperty: null,
      },
      {
        hasOwnProperty: true,
      },
    ),
  ).toBe(true);
});
