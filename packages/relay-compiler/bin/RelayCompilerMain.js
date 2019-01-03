/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

require('@babel/polyfill');

const CodegenRunner = require('../codegen/CodegenRunner');
const ConsoleReporter = require('../reporters/GraphQLConsoleReporter');
const DotGraphQLParser = require('../core/DotGraphQLParser');
const WatchmanClient = require('../core/GraphQLWatchmanClient');

const RelaySourceModuleParser = require('../core/RelaySourceModuleParser');
const RelayFileWriter = require('../codegen/RelayFileWriter');
const RelayIRTransforms = require('../core/RelayIRTransforms');
const RelayLanguagePluginJavaScript = require('../language/javascript/RelayLanguagePluginJavaScript');

const fs = require('fs');
const path = require('path');

const {
  buildASTSchema,
  buildClientSchema,
  parse,
  printSchema,
} = require('graphql');

const {
  commonTransforms,
  codegenTransforms,
  fragmentTransforms,
  printTransforms,
  queryTransforms,
  schemaExtensions,
} = RelayIRTransforms;

import type {WriteFilesOptions} from '../codegen/CodegenRunner';
import type {GraphQLSchema} from 'graphql';
import type {
  PluginInitializer,
  PluginInterface,
} from '../language/RelayLanguagePluginInterface';

function buildWatchExpression(options: {
  extensions: Array<string>,
  include: Array<string>,
  exclude: Array<string>,
}) {
  return [
    'allof',
    ['type', 'f'],
    ['anyof', ...options.extensions.map(ext => ['suffix', ext])],
    [
      'anyof',
      ...options.include.map(include => ['match', include, 'wholename']),
    ],
    ...options.exclude.map(exclude => ['not', ['match', exclude, 'wholename']]),
  ];
}

function getFilepathsFromGlob(
  baseDir,
  options: {
    extensions: Array<string>,
    include: Array<string>,
    exclude: Array<string>,
  },
): Array<string> {
  const {extensions, include, exclude} = options;
  const patterns = include.map(inc => `${inc}/*.+(${extensions.join('|')})`);

  const glob = require('fast-glob');
  return glob.sync(patterns, {
    cwd: baseDir,
    ignore: exclude,
  });
}

type LanguagePlugin = PluginInitializer | {default: PluginInitializer};

/**
 * Unless the requested plugin is the builtin `javascript` one, import a
 * language plugin as either a CommonJS or ES2015 module.
 *
 * When importing, first check if it’s a path to an existing file, otherwise
 * assume it’s a package and prepend the plugin namespace prefix.
 *
 * Make sure to always use Node's `require` function, which otherwise would get
 * replaced with `__webpack_require__` when bundled using webpack, by using
 * `eval` to get it at runtime.
 */
function getLanguagePlugin(language: string): PluginInterface {
  if (language === 'javascript') {
    return RelayLanguagePluginJavaScript();
  } else {
    const pluginPath = path.resolve(process.cwd(), language);
    const requirePath = fs.existsSync(pluginPath)
      ? pluginPath
      : `relay-compiler-language-${language}`;
    try {
      // eslint-disable-next-line no-eval
      let languagePlugin: LanguagePlugin = eval('require')(requirePath);
      if (languagePlugin.default) {
        languagePlugin = languagePlugin.default;
      }
      if (typeof languagePlugin === 'function') {
        return languagePlugin();
      } else {
        throw new Error('Expected plugin to export a function.');
      }
    } catch (err) {
      const e = new Error(
        `Unable to load language plugin ${requirePath}: ${err.message}`,
      );
      e.stack = err.stack;
      throw e;
    }
  }
}

async function main(options: {
  schema: string,
  src: string,
  extensions: Array<string>,
  include: Array<string>,
  exclude: Array<string>,
  verbose: boolean,
  watchman: boolean,
  watch?: ?boolean,
  validate: boolean,
  quiet: boolean,
  persistOutput: ?string,
  noFutureProofEnums: boolean,
  language: string,
  artifactDirectory: ?string,
}) {
  const schemaPath = path.resolve(process.cwd(), options.schema);
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`--schema path does not exist: ${schemaPath}.`);
  }
  const srcDir = path.resolve(process.cwd(), options.src);
  if (!fs.existsSync(srcDir)) {
    throw new Error(`--src path does not exist: ${srcDir}.`);
  }

  let persistedQueryPath = options.persistOutput;
  if (typeof persistedQueryPath === 'string') {
    persistedQueryPath = path.resolve(process.cwd(), persistedQueryPath);
    const persistOutputDir = path.dirname(persistedQueryPath);
    if (!fs.existsSync(persistOutputDir)) {
      throw new Error(
        `--persist-output path does not exist: ${persistedQueryPath}.`,
      );
    }
  }
  if (options.watch && !options.watchman) {
    throw new Error('Watchman is required to watch for changes.');
  }
  if (options.watch && !hasWatchmanRootFile(srcDir)) {
    throw new Error(
      `
--watch requires that the src directory have a valid watchman "root" file.

Root files can include:
- A .git/ Git folder
- A .hg/ Mercurial folder
- A .watchmanconfig file

Ensure that one such file exists in ${srcDir} or its parents.
    `.trim(),
    );
  }
  if (options.verbose && options.quiet) {
    throw new Error("I can't be quiet and verbose at the same time");
  }

  const reporter = new ConsoleReporter({
    verbose: options.verbose,
    quiet: options.quiet,
  });

  const useWatchman = options.watchman && (await WatchmanClient.isAvailable());

  const schema = getSchema(schemaPath);

  const languagePlugin = getLanguagePlugin(options.language);

  const inputExtensions = options.extensions || languagePlugin.inputExtensions;
  const outputExtension = languagePlugin.outputExtension;

  const sourceParserName = inputExtensions.join('/');
  const sourceWriterName = outputExtension;

  const sourceModuleParser = RelaySourceModuleParser(
    languagePlugin.findGraphQLTags,
  );

  const providedArtifactDirectory = options.artifactDirectory;
  const artifactDirectory =
    providedArtifactDirectory != null
      ? path.resolve(process.cwd(), providedArtifactDirectory)
      : null;

  const generatedDirectoryName = artifactDirectory || '__generated__';

  const sourceSearchOptions = {
    extensions: inputExtensions,
    include: options.include,
    exclude: ['**/*.graphql.*', ...options.exclude], // Do not include artifacts
  };
  const graphqlSearchOptions = {
    extensions: ['graphql'],
    include: options.include,
    exclude: [path.relative(srcDir, schemaPath)].concat(options.exclude),
  };

  const parserConfigs = {
    [sourceParserName]: {
      baseDir: srcDir,
      getFileFilter: sourceModuleParser.getFileFilter,
      getParser: sourceModuleParser.getParser,
      getSchema: () => schema,
      watchmanExpression: useWatchman
        ? buildWatchExpression(sourceSearchOptions)
        : null,
      filepaths: useWatchman
        ? null
        : getFilepathsFromGlob(srcDir, sourceSearchOptions),
    },
    graphql: {
      baseDir: srcDir,
      getParser: DotGraphQLParser.getParser,
      getSchema: () => schema,
      watchmanExpression: useWatchman
        ? buildWatchExpression(graphqlSearchOptions)
        : null,
      filepaths: useWatchman
        ? null
        : getFilepathsFromGlob(srcDir, graphqlSearchOptions),
    },
  };
  const writerConfigs = {
    [sourceWriterName]: {
      writeFiles: getRelayFileWriter(
        srcDir,
        languagePlugin,
        options.noFutureProofEnums,
        artifactDirectory,
        persistedQueryPath,
      ),
      isGeneratedFile: (filePath: string) =>
        filePath.endsWith('.graphql.' + outputExtension) &&
        filePath.includes(generatedDirectoryName),
      parser: sourceParserName,
      baseParsers: ['graphql'],
    },
  };
  const codegenRunner = new CodegenRunner({
    reporter,
    parserConfigs,
    writerConfigs,
    onlyValidate: options.validate,
    // TODO: allow passing in a flag or detect?
    sourceControl: null,
  });
  if (!options.validate && !options.watch && options.watchman) {
    // eslint-disable-next-line no-console
    console.log('HINT: pass --watch to keep watching for changes.');
  }
  const result = options.watch
    ? await codegenRunner.watchAll()
    : await codegenRunner.compileAll();

  if (result === 'ERROR') {
    process.exit(100);
  }
  if (options.validate && result !== 'NO_CHANGES') {
    process.exit(101);
  }
}

function getRelayFileWriter(
  baseDir: string,
  languagePlugin: PluginInterface,
  noFutureProofEnums: boolean,
  outputDir?: ?string,
  persistedQueryPath?: ?string,
) {
  return ({
    onlyValidate,
    schema,
    documents,
    baseDocuments,
    sourceControl,
    reporter,
  }: WriteFilesOptions) => {
    let persistQuery;
    let queryMap;
    if (persistedQueryPath != null) {
      queryMap = new Map();
      persistQuery = (text: string, id: string) => {
        queryMap.set(id, text);
        return Promise.resolve(id);
      };
    }
    const results = RelayFileWriter.writeAll({
      config: {
        baseDir,
        compilerTransforms: {
          commonTransforms,
          codegenTransforms,
          fragmentTransforms,
          printTransforms,
          queryTransforms,
        },
        customScalars: {},
        formatModule: languagePlugin.formatModule,
        optionalInputFieldsForFlow: [],
        schemaExtensions,
        useHaste: false,
        noFutureProofEnums,
        extension: languagePlugin.outputExtension,
        typeGenerator: languagePlugin.typeGenerator,
        outputDir,
        persistQuery,
      },
      onlyValidate,
      schema,
      baseDocuments,
      documents,
      reporter,
      sourceControl,
    });
    if (queryMap != null && persistedQueryPath != null) {
      const object = {};
      for (const [key, value] of queryMap.entries()) {
        object[key] = value;
      }
      const data = JSON.stringify(object, null, 2);
      fs.writeFileSync(persistedQueryPath, data, 'utf8');
    }
    return results;
  };
}

function getSchema(schemaPath: string): GraphQLSchema {
  try {
    let source = fs.readFileSync(schemaPath, 'utf8');
    if (path.extname(schemaPath) === '.json') {
      source = printSchema(buildClientSchema(JSON.parse(source).data));
    }
    source = `
  directive @include(if: Boolean) on FRAGMENT_SPREAD | FIELD
  directive @skip(if: Boolean) on FRAGMENT_SPREAD | FIELD

  ${source}
  `;
    return buildASTSchema(parse(source), {assumeValid: true});
  } catch (error) {
    throw new Error(
      `
Error loading schema. Expected the schema to be a .graphql or a .json
file, describing your GraphQL server's API. Error detail:

${error.stack}
    `.trim(),
    );
  }
}

// Ensure that a watchman "root" file exists in the given directory
// or a parent so that it can be watched
const WATCHMAN_ROOT_FILES = ['.git', '.hg', '.watchmanconfig'];
function hasWatchmanRootFile(testPath) {
  while (path.dirname(testPath) !== testPath) {
    if (
      WATCHMAN_ROOT_FILES.some(file => {
        return fs.existsSync(path.join(testPath, file));
      })
    ) {
      return true;
    }
    testPath = path.dirname(testPath);
  }
  return false;
}

module.exports = {main};
