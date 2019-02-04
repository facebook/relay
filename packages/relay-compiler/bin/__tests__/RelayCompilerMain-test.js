/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

jest.mock('fs', () => ({
  existsSync(path) {
    return path.startsWith('/existing/');
  },
}));

const {main} = require('../RelayCompilerMain');

describe('RelayCompilerMain', () => {
  it('should throw error when schema path does not exist', async () => {
    await expect(
      main({
        schema: '/nonexisting/schema.graphql',
        src: '/existing/',
      }),
    ).rejects.toEqual(
      new Error('--schema path does not exist: /nonexisting/schema.graphql'),
    );
  });

  it('should throw error when src path does not exist', async () => {
    await expect(
      main({
        schema: '/existing/schema.graphql',
        src: '/nonexisting/src',
      }),
    ).rejects.toEqual(new Error('--src path does not exist: /nonexisting/src'));
  });

  it('should throw error when persist-output parent directory does not exist', async () => {
    await expect(
      main({
        schema: '/existing/schema.graphql',
        src: '/existing/src/',
        persistOutput: '/nonexisting/output/',
      }),
    ).rejects.toEqual(
      new Error('--persist-output path does not exist: /nonexisting/output'),
    );
  });
});
