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

const {
  getCodegenRunner,
  getLanguagePlugin,
  main,
} = require('../RelayCompilerMain');
const RelayFileWriter = require('../../codegen/RelayFileWriter');
const RelayLanguagePluginJavaScript = require('../../language/javascript/RelayLanguagePluginJavaScript');
const {testSchemaPath} = require('relay-test-utils');
const path = require('path');

jest.mock('../../codegen/RelayFileWriter');

import type {PluginInitializer} from '../../language/RelayLanguagePluginInterface';

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
        `--persistOutput path does not exist: ${path.resolve(
          'non-existent/output',
        )}`,
      ),
    );
  });

  describe('getCodegenRunner', () => {
    const options = {
      schema: testSchemaPath,
      language: 'javascript',
      include: [],
      exclude: [],
      src: '.',
    };

    it('configures the language', () => {
      const codegenRunner = getCodegenRunner({
        ...options,
        language: 'javascript',
      });
      const config = codegenRunner.writerConfigs.js;
      expect(codegenRunner.parserConfigs[config.parser]).not.toBeUndefined();
    });

    it('configures the file writer with custom scalars', () => {
      const codegenRunner = getCodegenRunner({
        ...options,
        customScalars: {URL: 'String'},
      });
      const config = codegenRunner.writerConfigs.js;
      const writeFiles = config.writeFiles;
      writeFiles({onlyValidate: true});
      expect(RelayFileWriter.writeAll).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({customScalars: {URL: 'String'}}),
        }),
      );
    });
  });

  describe('getLanguagePlugin', () => {
    it('uses the builtin Flow generator for javascript', () => {
      expect(getLanguagePlugin('javascript')).toEqual(
        RelayLanguagePluginJavaScript(),
      );
    });

    it('accepts a plugin initializer function', () => {
      const plugin = jest.fn(() => RelayLanguagePluginJavaScript());
      expect(getLanguagePlugin(plugin)).toEqual(
        RelayLanguagePluginJavaScript(),
      );
      expect(plugin).toHaveBeenCalled();
    });

    it('accepts a plugin initializer function from a ES6 module', () => {
      const plugin = {default: jest.fn(() => RelayLanguagePluginJavaScript())};
      expect(getLanguagePlugin(plugin)).toEqual(
        RelayLanguagePluginJavaScript(),
      );
      expect(plugin.default).toHaveBeenCalled();
    });

    it('loads a plugin from a local module', () => {
      const pluginModuleMockPath = path.join(
        __dirname,
        'fixtures',
        'plugin-module.js',
      );
      expect(getLanguagePlugin(pluginModuleMockPath)).toEqual(
        require(pluginModuleMockPath)(),
      );
    });

    it('loads a module from the load path with the relay-compiler-language- prefix', () => {
      const plugin = jest.fn(() => RelayLanguagePluginJavaScript());
      jest.mock('relay-compiler-language-typescript', () => plugin, {
        virtual: true,
      });
      expect(getLanguagePlugin('typescript')).toEqual(
        RelayLanguagePluginJavaScript(),
      );
      expect(plugin).toHaveBeenCalled();
    });
  });
});
