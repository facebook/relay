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

describe('`development` option', () => {
  function transformOnPlatform(platform: string) {
    jest.resetModules();

    Object.defineProperty(process, 'platform', {
      value: platform,
    });

    jest.doMock('path', () => {
      if (platform === 'win32') {
        return jest.requireActual('path').win32;
      } else {
        return jest.requireActual('path').posix;
      }
    });

    const transformerWithOptions = require('./transformerWithOptions');

    return transformerWithOptions(
      {
        artifactDirectory: '/test/artifacts',
      },
      'development',
    )('graphql`fragment TestFrag on Node { id }`');
  }

  it('tests the handling of file path', () => {
    const codeOnPosix = transformOnPlatform('linux');
    const codeOnNonPosix = transformOnPlatform('win32');

    expect(codeOnNonPosix).toEqual(codeOnPosix);
    expect(codeOnPosix).toMatchSnapshot();
  });
});
