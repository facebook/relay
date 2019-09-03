/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

const mockWarning = jest.fn();
jest.mock('warning', () => mockWarning);

const React = require('react');
// $FlowFixMe
const TestRenderer = require('react-test-renderer');

const useStaticPropWarning = require('../useStaticPropWarning');

const warningMessage =
  'The %s has to remain the same over the lifetime of a component. Changing ' +
  'it is not supported and will result in unexpected behavior.';
const notWarned = [true, warningMessage, 'prop foo'];
const warned = [false, warningMessage, 'prop foo'];

function Example(props: {|+foo: string, +bar: string|}) {
  useStaticPropWarning(props.foo, 'prop foo');
  return null;
}

test('warn when a static prop changes', () => {
  // initial render doesn't warn
  const testRenderer = TestRenderer.create(<Example foo="foo1" bar="bar1" />);
  expect(mockWarning.mock.calls.length).toBe(1);
  expect(mockWarning.mock.calls[0]).toEqual(notWarned);

  // updating a non-checked prop doesn't warn
  testRenderer.update(<Example foo="foo1" bar="bar2" />);
  expect(mockWarning.mock.calls.length).toBe(2);
  expect(mockWarning.mock.calls[1]).toEqual(notWarned);

  // updating a expected static prop warns
  testRenderer.update(<Example foo="foo2" bar="bar2" />);
  expect(mockWarning.mock.calls.length).toBe(3);
  expect(mockWarning.mock.calls[2]).toEqual(warned);
});
