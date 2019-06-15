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
  GraphQLEnumType,
  GraphQLScalarType,
  GraphQLSchema,
  Kind,
  extendSchema,
  parse,
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
    types: [CropPosition, FileExtension, GraphQLJSONType],
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
      input ProfilePictureOptions {
        newName: String
      }

      extend type User {
        profilePicture2(
          size: [Int],
          preset: PhotoSize
          cropPosition: CropPosition
          fileExtension: FileExtension
          additionalParameters: JSON
          options: ProfilePictureOptions
        ): Image
      }
    `),
  );
}

function identity(value) {
  return value;
}

function parseLiteral(ast, variables) {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT: {
      const value = Object.create(null);
      ast.fields.forEach(field => {
        value[field.name.value] = parseLiteral(field.value, variables);
      });

      return value;
    }
    case Kind.LIST:
      return ast.values.map(n => parseLiteral(n, variables));
    case Kind.NULL:
      return null;
    case Kind.VARIABLE: {
      const name = ast.name.value;
      return variables ? variables[name] : undefined;
    }
    default:
      return undefined;
  }
}

const GraphQLJSONType = new GraphQLScalarType({
  name: 'JSON',
  description:
    'The `JSON` scalar type represents JSON values as specified by ' +
    '[ECMA-404](http://www.ecma-international.org/' +
    'publications/files/ECMA-ST/ECMA-404.pdf).',
  serialize: identity,
  parseValue: identity,
  parseLiteral,
});

module.exports = (buildSchema(): GraphQLSchema);
