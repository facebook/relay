/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

'use strict';

const transformerWithOptions = require('./transformerWithOptions');

describe('`development` option', () => {
  it('tests the hash when `development` is set', async () => {
    expect(
      await transformerWithOptions(
        {eagerEsModules: true},
        'development',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  it('tests the hash when `isDevVariable` is set', async () => {
    expect(
      await transformerWithOptions({
        eagerEsModules: true,
        isDevVariableName: 'IS_DEV',
      })('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  it('uses a custom build command in message', async () => {
    expect(
      await transformerWithOptions(
        {
          buildCommand: 'relay-compiler',
          eagerEsModules: true,
        },
        'development',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  it('does not test the hash when `development` is not set', async () => {
    expect(
      await transformerWithOptions(
        {eagerEsModules: true},
        'production',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });
});
