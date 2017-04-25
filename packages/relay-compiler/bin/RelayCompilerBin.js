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
 */

'use strict';

const RelayCodegenRunner = require('RelayCodegenRunner');
const RelayFileIRParser = require('RelayFileIRParser');
const RelayFileWriter = require('RelayFileWriter');
const RelayIRTransforms = require('RelayIRTransforms');

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
  schemaTransforms,
} = RelayIRTransforms;

import type {GraphQLSchema} from 'graphql';

const SCRIPT_NAME = 'relay-compiler';

function buildWatchExpression(options: {
  extensions: Array<string>
}) {
  return [
    'allof',
    ['type', 'f'],
    ['anyof', ...options.extensions.map(ext => ['suffix', ext])],
    ['not', ['match', '**/node_modules/**', 'wholename']],
    ['not', ['match', '**/__mocks__/**', 'wholename']],
    ['not', ['match', '**/__tests__/**', 'wholename']],
    ['not', ['match', '**/__generated__/**', 'wholename']],
  ];
}

/* eslint-disable no-console-disallow */

async function run(options: {
  schema: string,
  src: string,
  extensions: Array<string>,
  watch?: ?boolean,
}) {
  const schemaPath = path.resolve(process.cwd(), options.schema);
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`--schema path does not exist: ${schemaPath}.`);
  }
  const srcDir = path.resolve(process.cwd(), options.src);
  if (!fs.existsSync(srcDir)) {
    throw new Error(`--source path does not exist: ${srcDir}.`);
  }
  if (options.watch && !hasWatchmanRootFile(srcDir)) {
    throw new Error(`
--watch requires that the src directory have a valid watchman "root" file.

Root files can include:
- A .git/ Git folder
- A .hg/ Mercurial folder
- A .watchmanconfig file

Ensure that one such file exists in ${srcDir} or its parents.
    `.trim());
  }

  const parserConfigs = {
    default: {
      baseDir: srcDir,
      getFileFilter: RelayFileIRParser.getFileFilter,
      getParser: RelayFileIRParser.getParser,
      getSchema: () => getSchema(schemaPath),
      watchmanExpression: buildWatchExpression(options),
    },
  };
  const writerConfigs = {
    default: {
      getWriter: getRelayFileWriter(srcDir),
      parser: 'default',
    },
  };
  const codegenRunner = new RelayCodegenRunner({
    parserConfigs,
    writerConfigs,
    onlyValidate: false,
    skipPersist: true,
  });
  if (options.watch) {
    await codegenRunner.watchAll();
  } else {
    console.log('HINT: pass --watch to keep watching for changes.');
    await codegenRunner.compileAll();
  }
}

function getRelayFileWriter(baseDir: string) {
  return (onlyValidate, schema, documents, baseDocuments) => new RelayFileWriter({
    config: {
      buildCommand: SCRIPT_NAME,
      compilerTransforms: {
        codegenTransforms,
        fragmentTransforms,
        printTransforms,
        queryTransforms,
      },
      baseDir,
      schemaTransforms,
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
  directive @relay(pattern: Boolean, plural: Boolean) on FRAGMENT | FIELD

  ${source}
  `;
    return buildASTSchema(parse(source));
  } catch (error) {
    throw new Error(`
Error loading schema. Expected the schema to be a .graphql or a .json
file, describing your GraphQL server's API. Error detail:

${error.stack}
    `.trim());
  }
}

// Ensure that a watchman "root" file exists in the given directory
// or a parent so that it can be watched
const WATCHMAN_ROOT_FILES = ['.git', '.hg', '.watchmanconfig'];
function hasWatchmanRootFile(testPath) {
  while (path.dirname(testPath) !== testPath) {
    if (WATCHMAN_ROOT_FILES.some(file => {
      return fs.existsSync(path.join(testPath, file));
    })) {
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
    '$0 --schema <path> --src <path> [--watch]')
  .options({
    'schema': {
      describe: 'Path to schema.graphql or schema.json',
      demandOption: true,
      type: 'string',
    },
    'src': {
      describe: 'Root directory of application code',
      demandOption: true,
      type: 'string',
    },
    'extensions': {
      array: true,
      default: ['js'],
      describe: 'File extensions to compile (--extensions js jsx)',
      type: 'string',
    },
    'watch': {
      describe: 'If specified, watches files and regenerates on changes',
      type: 'boolean',
    },
  })
  .help()
  .argv;

// Run script with args
run(argv).catch(error => {
  console.error(String(error.stack || error));
  process.exit(1);
});
