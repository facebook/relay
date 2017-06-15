/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

jest.disableAutomock();

const getModuleName = require('getModuleName');

test('getModuleName', () => {
  expect(getModuleName('/path/Button.js')).toBe('Button');
  expect(getModuleName('/path/Slider.ios.js')).toBe('Slider');
  expect(getModuleName('/path/Typescript.ts')).toBe('Typescript');

  // This could be 'Button' instead
  expect(getModuleName('/path/button/index.js')).toBe('button');

  // Maybe this should be FooBar to make it compatible with compat mode
  expect(getModuleName('/path/foo-bar/index.js')).toBe('foo_bar');
  expect(getModuleName('/path/foo-bar-baz.js')).toBe('foo_bar_baz');

  // This could be InputTest or Input?
  expect(getModuleName('/path/Input-test.js')).toBe('Input_test');
});
