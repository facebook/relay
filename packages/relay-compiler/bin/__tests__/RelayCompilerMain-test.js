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

// jest.mock('fs', () => ({
//   existsSync(path) {
//     return path.startsWith('/existent/');
//   },
// }));

jest.mock('../../codegen/RelayFileWriter');
const RelayFileWriter = require('../../codegen/RelayFileWriter');

const {getCodegenRunner, main} = require('../RelayCompilerMain');
const {testSchemaPath} = require('relay-test-utils');
const path = require('path');

describe('RelayCompilerMain', () => {
  it('throws when schema path does not exist', async () => {
    await expect(
      main({
        schema: './non-existent/schema.graphql',
        src: '.',
      }),
    ).rejects.toEqual(
      new Error(
        `--schema path does not exist: ${path.resolve(
          'non-existent/schema.graphql',
        )}`,
      ),
    );
  });

  it('throws when src path does not exist', async () => {
    await expect(
      main({
        schema: testSchemaPath,
        src: './non-existent/src',
      }),
    ).rejects.toEqual(
      new Error(
        `--src path does not exist: ${path.resolve('non-existent/src')}`,
      ),
    );
  });

  it('throws when persist-output parent directory does not exist', async () => {
    await expect(
      main({
        schema: testSchemaPath,
        src: '.',
        persistOutput: './non-existent/output/',
      }),
    ).rejects.toEqual(
      new Error(
        `--persist-output path does not exist: ${path.resolve(
          'non-existent/output',
        )}`,
      ),
    );
  });

  describe('concerning the codegen runner', () => {
    const options = {
      schema: testSchemaPath,
      language: 'javascript',
      include: [],
      exclude: [],
      src: '.',
    };

    describe('and its writer configurations', () => {
      it('configures the language', () => {
        const codegenRunner = getCodegenRunner({
          language: 'javascript',
          ...options,
        });
        const config = codegenRunner.writerConfigs.js;
        expect(codegenRunner.parserConfigs[config.parser]).not.toBeUndefined();
      });

      it('configures the file writer with custom scalars', () => {
        const codegenRunner = getCodegenRunner({...options});
        const config = codegenRunner.writerConfigs.js;
        const writeFiles = config.writeFiles;
        writeFiles({onlyValidate: true});
        expect(RelayFileWriter.writeAll).toHaveBeenCalledWith(
          expect.objectContaining({
            config: expect.objectContaining({customScalars: {}}),
          }),
        );
      });
    });
  });
});
