/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails
 * @flow strict
 * @format
 */

'use strict';

const {getAnnotatedName, getOriginalName} = require('../GraphQLIRSplitNaming');

test('annotate', () => {
  expect(getAnnotatedName('MyFragment', 'split')).toBe('MyFragment$split');
});

test('remove annotation', () => {
  expect(getOriginalName('MyFragment$split')).toBe('MyFragment');
  expect(getOriginalName('MyFragment')).toBe('MyFragment');
});
