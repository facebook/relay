/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const transformerWithOptions = require('./transformerWithOptions');

describe('`development` option', () => {
  it('tests the hash when `development` is set', () => {
    expect(
      transformerWithOptions(
        {},
        'development',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  it('tests the hash when `isDevVariableName` is set', () => {
    expect(
      transformerWithOptions({isDevVariableName: 'IS_DEV'})(
        'graphql`fragment TestFrag on Node { id }`',
      ),
    ).toMatchSnapshot();
  });

  it('uses a custom build command in message', () => {
    expect(
      transformerWithOptions(
        {
          codegenCommand: 'relay-build',
        },
        'development',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  it('does not test the hash when `development` is not set', () => {
    expect(
      transformerWithOptions(
        {},
        'production',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });
});
