/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule RelayCompilerBin
 * @format
 */

'use strict';

require('babel-polyfill');

const RelayCodegenRunner = require('RelayCodegenRunner');
const RelayConsoleReporter = require('RelayConsoleReporter');
const RelayFileIRParser = require('RelayFileIRParser');
const RelayFileWriter = require('RelayFileWriter');
const RelayIRTransforms = require('RelayIRTransforms');
const RelayWatchmanClient = require('RelayWatchmanClient');

const formatGeneratedModule = require('formatGeneratedModule');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

const {
  buildASTSchema,
  buildClientSchema,
  parse,
  printSchema,
} = require('graphql');

const {
  codegenTransforms,
  fragmentTransforms,
  printTransforms,
  queryTransforms,
  schemaExtensions,
} = RelayIRTransforms;

import type {GraphQLSchema} from 'graphql';

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

  // $FlowFixMe(site=react_native_fb,www)
  const glob = require('fast-glob');
  return glob.sync(patterns, {
    cwd: baseDir,
    bashNative: [],
    onlyFiles: true,
    ignore: exclude,
  });
}

/* eslint-disable no-console-disallow */

async function run(options: {
  schema: string,
  src: string,
  extensions: Array<string>,
  include: Array<string>,
  exclude: Array<string>,
  verbose: boolean,
  watchman: boolean,
  watch?: ?boolean,
  validate: boolean,
}) {
  const schemaPath = path.resolve(process.cwd(), options.schema);
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`--schema path does not exist: ${schemaPath}.`);
  }
  const srcDir = path.resolve(process.cwd(), options.src);
  if (!fs.existsSync(srcDir)) {
    throw new Error(`--source path does not exist: ${srcDir}.`);
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

  const reporter = new RelayConsoleReporter({verbose: options.verbose});

  const useWatchman =
    options.watchman && (await RelayWatchmanClient.isAvailable());

  const parserConfigs = {
    default: {
      baseDir: srcDir,
      getFileFilter: RelayFileIRParser.getFileFilter,
      getParser: RelayFileIRParser.getParser,
      getSchema: () => getSchema(schemaPath),
      watchmanExpression: useWatchman ? buildWatchExpression(options) : null,
      filepaths: useWatchman ? null : getFilepathsFromGlob(srcDir, options),
    },
  };
  const writerConfigs = {
    default: {
      getWriter: getRelayFileWriter(srcDir),
      isGeneratedFile: (filePath: string) =>
        filePath.endsWith('.js') && filePath.includes('__generated__'),
      parser: 'default',
    },
  };
  const codegenRunner = new RelayCodegenRunner({
    reporter,
    parserConfigs,
    writerConfigs,
    onlyValidate: options.validate,
  });
  if (!options.validate && !options.watch && options.watchman) {
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

function getRelayFileWriter(baseDir: string) {
  return (onlyValidate, schema, documents, baseDocuments) =>
    new RelayFileWriter({
      config: {
        formatModule: formatGeneratedModule,
        compilerTransforms: {
          codegenTransforms,
          fragmentTransforms,
          printTransforms,
          queryTransforms,
        },
        baseDir,
        schemaExtensions,
      },
      onlyValidate,
      schema,
      baseDocuments,
      documents,
    });
}

function getSchema(schemaPath: string): GraphQLSchema {
  try {
    let source = fs.readFileSync(schemaPath, 'utf8');
    if (path.extname(schemaPath) === '.json') {
      source = printSchema(buildClientSchema(JSON.parse(source).data));
    }
    source = `
  directive @include(if: Boolean) on FRAGMENT | FIELD
  directive @skip(if: Boolean) on FRAGMENT | FIELD

  ${source}
  `;
    return buildASTSchema(parse(source));
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

// Collect args
const argv = yargs
  .usage(
    'Create Relay generated files\n\n' +
      '$0 --schema <path> --src <path> [--watch]',
  )
  .options({
    schema: {
      describe: 'Path to schema.graphql or schema.json',
      demandOption: true,
      type: 'string',
    },
    src: {
      describe: 'Root directory of application code',
      demandOption: true,
      type: 'string',
    },
    include: {
      array: true,
      default: ['**'],
      describe: 'Directories to include under src',
      type: 'string',
    },
    exclude: {
      array: true,
      default: [
        '**/node_modules/**',
        '**/__mocks__/**',
        '**/__tests__/**',
        '**/__generated__/**',
      ],
      describe: 'Directories to ignore under src',
      type: 'string',
    },
    extensions: {
      array: true,
      default: ['js'],
      describe: 'File extensions to compile (--extensions js jsx)',
      type: 'string',
    },
    verbose: {
      describe: 'More verbose logging',
      type: 'boolean',
    },
    watchman: {
      describe: 'Use watchman when not in watch mode',
      type: 'boolean',
      default: true,
    },
    watch: {
      describe: 'If specified, watches files and regenerates on changes',
      type: 'boolean',
    },
    validate: {
      describe:
        'Looks for pending changes and exits with non-zero code instead of ' +
        'writing to disk',
      type: 'boolean',
      default: false,
    },
  })
  .help().argv;

// Run script with args
run(argv).catch(error => {
  console.error(String(error.stack || error));
  process.exit(1);
});
