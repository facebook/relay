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

jest.mock('fs');

const {main} = require('../RelayCompilerMain');

describe('RelayCompilerMain', () => {
  it('should throw error when schema path does not exist', async () => {
    expect(
      main({
        schema: './some/path/schema.graphql',
        src: './',
      }),
    ).rejects.toEqual(
      new Error(
        "--schema './some/path/schema.graphql' invalid: path does not exist",
      ),
    );
  });

  it('should throw error when src path does not exist', async () => {
    expect(
      main({
        schema: './',
        src: './some/path/src',
      }),
    ).rejects.toEqual(
      new Error("--src './some/path/src' invalid: path does not exist"),
    );
  });

  it('should throw error when persist-output parent directory does not exist', async () => {
    expect(
      main({
        schema: './',
        src: './',
        persistOutput: './some/path/queries.json',
      }),
    ).rejects.toEqual(
      new Error(
        "--persist-output './some/path/queries.json' invalid: parent directory does not exist",
      ),
    );
  });
});
