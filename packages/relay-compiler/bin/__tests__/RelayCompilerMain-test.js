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

const path = require('path');

const RelayFileWriter = require('../../codegen/RelayFileWriter');
const {
  isAvailable: isWatchmanAvailable,
} = require('../../core/GraphQLWatchmanClient');
const RelayLanguagePluginJavaScript = require('../../language/javascript/RelayLanguagePluginJavaScript');
const {testSchemaPath} = require('relay-test-utils');

const RelayCompilerMain = require('../RelayCompilerMain');
const {
  getCodegenRunner,
  getLanguagePlugin,
  getWatchConfig,
  main,
} = RelayCompilerMain;

import type {PluginInitializer} from '../../language/RelayLanguagePluginInterface';

jest.mock('../../codegen/RelayFileWriter');
jest.mock('../../core/GraphQLWatchmanClient');

isWatchmanAvailable.mockImplementation(() => Promise.resolve(true));

describe('RelayCompilerMain', () => {
  let config;

  beforeEach(() => {
    config = {
      exclude: [],
      include: [],
      language: 'javascript',
      schema: testSchemaPath,
      src: path.resolve('.'),
      validate: false,
      watch: true,
      watchman: true,
    };
  });

  describe('main', () => {
    let getCodegenRunnerSpy;
    let codegenRunnerMock;

    beforeEach(() => {
      codegenRunnerMock = {
        watchAll: jest.fn(),
        compileAll: jest.fn(),
      };
      getCodegenRunnerSpy = jest
        .spyOn(RelayCompilerMain, 'getCodegenRunner')
        .mockImplementation(() => codegenRunnerMock);
    });

    afterEach(() => {
      getCodegenRunnerSpy.mockRestore();
    });

    it('throws when schema path does not exist', async () => {
      await expect(
        main({
          ...config,
          schema: './non-existent/schema.graphql',
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
          ...config,
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
          ...config,
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

    it('throws when enabling both verbose and quiet mode', async () => {
      await expect(
        main({...config, verbose: true, quiet: true}),
      ).rejects.toThrow();
    });

    it('invokes getCodegenRunner with the correct watchman config', async () => {
      isWatchmanAvailable.mockImplementationOnce(() => Promise.resolve(false));
      await main(config);
      expect(getCodegenRunnerSpy).toHaveBeenCalledWith(
        expect.objectContaining({watchman: false}),
      );
    });

    it('tells the CodegenRunner instance to watch', async () => {
      await main({...config, watch: true});
      expect(codegenRunnerMock.watchAll).toHaveBeenCalled();
    });

    it('tells the CodegenRunner instance to do a single compilation pass', async () => {
      await main({...config, watch: false});
      expect(codegenRunnerMock.compileAll).toHaveBeenCalled();
    });
  });

  describe('getWatchConfig', () => {
    let logSpy;

    beforeEach(() => {
      logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
      logSpy.mockRestore();
    });

    it('works', async () => {
      expect(await getWatchConfig(config)).toEqual(config);
    });

    it('throws when enabling watch mode but disabling watchman', async () => {
      await expect(
        getWatchConfig({...config, watchman: false}),
      ).rejects.toThrowError(/watchman is required/i);
    });

    it('throws when enabling watch mode but not having a watchman root file', async () => {
      const spy = jest
        .spyOn(RelayCompilerMain, 'hasWatchmanRootFile')
        .mockImplementation(() => false);
      await expect(getWatchConfig(config)).rejects.toThrowError(
        /have a valid watchman "root" file/i,
      );
      spy.mockRestore();
    });

    it('disables the watchman setting if watchman is not available', async () => {
      isWatchmanAvailable.mockImplementationOnce(() => Promise.resolve(false));
      expect(await getWatchConfig(config)).toEqual({
        ...config,
        watchman: false,
      });
    });

    it('does not enable watchman if disabled by user, regardless of watchman being available', async () => {
      const result = await getWatchConfig({
        ...config,
        watch: false,
        watchman: false,
      });
      expect(result.watchman).toEqual(false);
    });

    describe('concerning its hint to enable watch mode', () => {
      beforeEach(() => {
        config = {...config, watch: false, validate: false};
      });

      it('logs when not watching, not validating artifacts, and watchman being available', async () => {
        await getWatchConfig(config);
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringMatching(/pass --watch/i),
        );
      });

      it('does not log when only validating artifacts', async () => {
        await getWatchConfig({...config, validate: true});
        expect(logSpy).not.toHaveBeenCalled();
      });

      it('does not log when watchman is not available', async () => {
        isWatchmanAvailable.mockImplementationOnce(() =>
          Promise.resolve(false),
        );
        await getWatchConfig(config);
        expect(logSpy).not.toHaveBeenCalled();
      });
    });
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
