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

const getModuleName = require('getModuleName');

test('getModuleName', () => {
  expect(getModuleName('/path/Button.js')).toBe('Button');
  expect(getModuleName('/path/Button.js.flow')).toBe('Button');
  expect(getModuleName('/path/Slider.ios.js')).toBe('Slider');
  expect(getModuleName('/path/Typescript.ts')).toBe('Typescript');
  expect(getModuleName('/path/button/index.js')).toBe('button');
  expect(getModuleName('/path/button/index.js.flow')).toBe('button');
  expect(getModuleName('/path/foo-bar/index.js')).toBe('fooBar');
  expect(getModuleName('/path/foo-bar-baz.js')).toBe('fooBarBaz');
  expect(getModuleName('/path/non-numeric-end-.js')).toBe('nonNumericEnd');

  // This could be InputTest or Input?
  expect(getModuleName('/path/Input-test.js')).toBe('InputTest');
});
