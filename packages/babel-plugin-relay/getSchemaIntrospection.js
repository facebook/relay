/**
 * Copyright (c) 2013-present, Facebook, Inc.
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

function getSchemaIntrospection(schemaPath: string, basePath: ?string) {
  try {
    let fullSchemaPath = schemaPath;
    if (!fs.existsSync(fullSchemaPath) && basePath) {
      fullSchemaPath = path.join(basePath, schemaPath);
    }
    const source = fs.readFileSync(fullSchemaPath, 'utf8');
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
