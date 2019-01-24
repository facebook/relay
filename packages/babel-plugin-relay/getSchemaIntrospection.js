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

const fs = require('fs');
const path = require('path');

const {SCHEMA_EXTENSION} = require('./GraphQLRelayDirective');
const {parse} = require('graphql');

function readSource(sourceFile: string, basePath: ?string): string {
  const fullSourceFile =
    !fs.existsSync(sourceFile) && basePath
      ? path.join(basePath, sourceFile)
      : sourceFile;

  return fs.readFileSync(fullSourceFile, 'utf8');
}

function getSchemaIntrospection(schemaPath: string, basePath: ?string) {
  try {
    const schemaPaths = schemaPath.split(',');
    if (schemaPaths.length > 1) {
      return parse(
        SCHEMA_EXTENSION +
          '\n' +
          schemaPaths.map(file => readSource(file, basePath)).join('\n'),
      );
    }

    const source = readSource(schemaPath, basePath);
    if (source[0] === '{') {
      return JSON.parse(source);
    }
    return parse(SCHEMA_EXTENSION + '\n' + source);
  } catch (error) {
    // Log a more helpful warning (by including the schema path).
    console.error(
      'Encountered the following error while loading the GraphQL schema: ' +
        schemaPath +
        '\n\n' +
        error.stack
          .split('\n')
          .map(line => '> ' + line)
          .join('\n'),
    );
    throw error;
  }
}

module.exports = getSchemaIntrospection;
