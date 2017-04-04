/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule RelayOSSCodegenRunner
 */

'use strict';

const RelayCodegenRunner = require('RelayCodegenRunner');
const RelayFileIRParser = require('RelayFileIRParser');
const RelayFileWriter = require('RelayFileWriter');
const RelayIRTransforms = require('RelayIRTransforms');

const fs = require('fs');
const path = require('path');

const {buildASTSchema, parse} = require('graphql');
const {
  codegenTransforms,
  fragmentTransforms,
  printTransforms,
  queryTransforms,
  schemaTransforms,
} = RelayIRTransforms;

import type {GraphQLSchema} from 'graphql';

// TODO: change this to the name of the final build commaned
const SCRIPT_NAME = '<relay-compiler>';
const WATCH_EXPRESSION = [
  'allof',
  ['type', 'f'],
  ['suffix', 'js'],
  ['not', ['match', '**/__mocks__/**', 'wholename']],
  ['not', ['match', '**/__tests__/**', 'wholename']],
];

/* eslint-disable no-console-disallow */

async function run(options: {
  help?: ?boolean,
  output?: ?string,
  schema?: ?string,
  src?: ?string,
  watch?: ?boolean,
}) {
  if (options.help) {
    showHelp();
    process.exit(1);
  }

  const schemaPath = path.resolve(process.cwd(), options.schema);
  if (!fs.existsSync(schemaPath)) {
    console.log(`--schema path does not exist: ${schemaPath}.`);
    process.exit(1);
  }
  const srcDir = path.resolve(process.cwd(), options.src);
  if (!fs.existsSync(srcDir)) {
    console.log(`--source path does not exist: ${srcDir}.`);
    process.exit(1);
  }
  if (options.watch && !hasWatchmanRootFile(srcDir)) {
    console.log(`
--watch requires that the src directory have a valid watchman "root" file.

Root files can include:
- A .git/ Git folder
- A .hg/ Mercurial folder
- A .watchmanconfig file

Ensure that one such file exists in ${srcDir} or its parents.
    `.trim());
    process.exit(1);
  }
  const outputDir = path.resolve(process.cwd(), options.output);
  if (!fs.existsSync(outputDir)) {
    console.log(`--output path does not exist: ${outputDir}.`);
    process.exit(1);
  }
  const parserConfigs = {
    default: {
      baseDir: srcDir,
      getFileFilter: RelayFileIRParser.getFileFilter,
      getParser: RelayFileIRParser.getParser,
      getSchema: () => getSchema(schemaPath),
      watchmanExpression: WATCH_EXPRESSION,
    },
  };
  const writerConfigs = {
    default: {
      getWriter: getRelayFileWriter(outputDir),
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

function getRelayFileWriter(outputDir: string) {
  return (onlyValidate, schema, documents, baseDocuments) => new RelayFileWriter({
    config: {
      buildCommand: SCRIPT_NAME,
      compilerTransforms: {
        codegenTransforms,
        fragmentTransforms,
        printTransforms,
        queryTransforms,
      },
      outputDir,
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
    source = `
  directive @include(if: Boolean) on FRAGMENT | FIELD
  directive @skip(if: Boolean) on FRAGMENT | FIELD
  directive @relay(pattern: Boolean, plural: Boolean) on FRAGMENT | FIELD

  ${source}
  `;
    return buildASTSchema(parse(source));
  } catch (error) {
    console.log(`
Error loading schema. Expected the schema to be a .graphql file using the
GraphQL schema definition language. Error detail:

${error.stack}
    `.trim());
    process.exit(1);
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

function showHelp(): void {
  console.log(`
Usage:
  ${SCRIPT_NAME} --schema <path> --src <path> --output <path> [--watch]'

Options:
  --schema <path>: Path to schema.graphql.
  --src <path>: Root directory of application code.
  --output <path>: Directory to which generated code will be written.
  --watch: (optional) If specified, watches files and regenerates on changes.
  `.trim());
}

module.exports = {run};
