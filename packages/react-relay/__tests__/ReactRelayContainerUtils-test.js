/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

const {
  getComponentName,
  getContainerName,
} = require('../ReactRelayContainerUtils');
const React = require('react');

test('functional component', () => {
  function Foo() {
    return null;
  }
  expect(getComponentName(Foo)).toBe('Foo');
  expect(getContainerName(Foo)).toBe('Relay(Foo)');

  expect(getComponentName(() => null)).toBe('Component');
  expect(getContainerName(() => null)).toBe('Relay(Component)');
});

test('React.Component', () => {
  class Foo extends React.Component {}
  expect(getComponentName(Foo)).toBe('Foo');
  expect(getContainerName(Foo)).toBe('Relay(Foo)');
});

test('React.forwardRef', () => {
  function ForwardRef(props, ref) {
    return null;
  }
  const ForwardRefContainer = React.forwardRef(ForwardRef);
  expect(getComponentName(ForwardRefContainer)).toBe('Component');
  expect(getContainerName(ForwardRefContainer)).toBe('Relay(Component)');
});
