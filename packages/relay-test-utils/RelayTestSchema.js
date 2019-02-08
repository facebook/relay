/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

const RelayTestSchemaPath = require('./RelayTestSchemaPath');

const fs = require('fs');

const {
  buildASTSchema,
  parse,
  GraphQLEnumType,
  GraphQLSchema,
  extendSchema,
} = require('graphql');

function buildSchema() {
  const CropPosition = new GraphQLEnumType({
    name: 'CropPosition',
    values: {
      TOP: {value: 1},
      CENTER: {value: 2},
      BOTTOM: {value: 3},
      LEFT: {value: 4},
      RIGHT: {value: 5},
    },
  });
  const FileExtension = new GraphQLEnumType({
    name: 'FileExtension',
    values: {
      JPG: {value: 'jpg'},
      PNG: {value: 'png'},
    },
  });
  let schema = new GraphQLSchema({
    types: [CropPosition, FileExtension],
  });
  schema = extendSchema(
    schema,
    parse(fs.readFileSync(RelayTestSchemaPath, 'utf8')),
  );
  // AST Builder doesn't allow things undefined in AST to be argument types it
  // seems
  return extendSchema(
    schema,
    parse(`
      extend type User {
        profilePicture2(
          size: [Int],
          preset: PhotoSize,
          cropPosition: CropPosition,
          fileExtension: FileExtension
        ): Image
      }
    `),
  );
}

module.exports = buildSchema();
