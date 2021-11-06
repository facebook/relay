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

const getModuleName = require('../getModuleName');

test('getModuleName', () => {
  expect(getModuleName('/path/Button.ios.js')).toBe('ButtonIos');
  expect(getModuleName('/path/Button.android.js')).toBe('ButtonAndroid');
  expect(getModuleName('/path/Button.hooks.android.js')).toBe('ButtonAndroid');
  expect(getModuleName('/path/Button.js')).toBe('Button');
  expect(getModuleName('/path/Button.react.js')).toBe('Button');
  expect(getModuleName('/path/Button.react-test.js')).toBe('Button');
  expect(getModuleName('/path/Button.react-test.jsx')).toBe('Button');
  expect(getModuleName('/path/Button.react.example.jsx')).toBe('Button');
  expect(getModuleName('/path/Button.react-snapshot-test.js')).toBe('Button');
  expect(getModuleName('/path/Button.kit.js')).toBe('Button');
  expect(getModuleName('/path/Button.hooks.js')).toBe('Button');
  expect(getModuleName('/path/Button.brands.react.js')).toBe('Button');
  expect(getModuleName('/path/Button.my.custom.suffix.js')).toBe('Button');
  expect(getModuleName('/path/Slider.ios.js')).toBe('SliderIos');
  expect(getModuleName('/path/Typescript.ts')).toBe('Typescript');
  expect(getModuleName('/path/Typescript.tsx')).toBe('Typescript');
  expect(getModuleName('/path/button/index.js')).toBe('button');
  expect(getModuleName('/path/foo-bar/index.js')).toBe('fooBar');
  expect(getModuleName('/path/foo-bar-baz.js')).toBe('fooBarBaz');
  expect(getModuleName('/path/non-numeric-end-.js')).toBe('nonNumericEnd');

  // This could be InputTest or Input?
  expect(getModuleName('/path/Input-test.js')).toBe('InputTest');
});
