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

// flowlint ambiguous-object-type:error

'use strict';

const mockWarning = jest.fn();
jest.mock('warning', () => mockWarning);

const useStaticFragmentNodeWarning = require('../useStaticFragmentNodeWarning');
const React = require('react');
const TestRenderer = require('react-test-renderer');

const warningMessage =
  'Relay: The %s has to remain the same over the lifetime of a component. Changing ' +
  'it is not supported and will result in unexpected behavior.';
const notWarned = [true, warningMessage, 'fragment input'];
const warned = [false, warningMessage, 'fragment input'];

function Example(props: {|+foo: {|+name: string|}, +bar: string|}) {
  // $FlowFixMe[prop-missing]
  useStaticFragmentNodeWarning(props.foo, 'fragment input');
  return null;
}

test('warn when a static prop changes', () => {
  const fragmentNode = {name: 'Fragment_foo'};

  // initial render doesn't warn
  const testRenderer = TestRenderer.create(
    <Example foo={fragmentNode} bar="bar1" />,
  );
  expect(mockWarning.mock.calls.length).toBe(1);
  expect(mockWarning.mock.calls[0]).toEqual(notWarned);

  // not updating props doesnt warn
  testRenderer.update(<Example foo={fragmentNode} bar="bar1" />);
  expect(mockWarning.mock.calls.length).toBe(2);
  expect(mockWarning.mock.calls[1]).toEqual(notWarned);

  // updating a non-checked prop doesn't warn
  testRenderer.update(<Example foo={fragmentNode} bar="bar2" />);
  expect(mockWarning.mock.calls.length).toBe(3);
  expect(mockWarning.mock.calls[2]).toEqual(notWarned);

  // different fragment node with same name doesn't warn
  testRenderer.update(<Example foo={{...fragmentNode}} bar="bar1" />);
  expect(mockWarning.mock.calls.length).toBe(4);
  expect(mockWarning.mock.calls[3]).toEqual(notWarned);

  // updating a expected static prop warns
  testRenderer.update(<Example foo={{name: 'OtherFragment_foo'}} bar="bar1" />);
  expect(mockWarning.mock.calls.length).toBe(5);
  expect(mockWarning.mock.calls[4]).toEqual(warned);
});
