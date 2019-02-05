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

const {buildASTSchema, parse} = require('graphql');
const {SchemaComposer} = require('graphql-compose');

function buildSchema() {
  // Compose upstream is going to add AST directives soon, making this simpler
  const composer = new SchemaComposer();
  const initialSchema = buildASTSchema(
    parse(fs.readFileSync(RelayTestSchemaPath, 'utf8'), {assumeValid: true}),
  );

  Object.keys(initialSchema.getTypeMap()).forEach(typeName => {
    const type = initialSchema.getType(typeName);
    composer.add(type);
  });

  const CropPositionETC = composer.getETC('CropPosition');
  CropPositionETC.setFields({
    TOP: {value: 1},
    CENTER: {value: 2},
    BOTTOM: {value: 3},
    LEFT: {value: 4},
    RIGHT: {value: 5},
  });
  const FileExtensionETC = composer.getETC('FileExtension');
  FileExtensionETC.setFields({
    JPG: {value: 'jpg'},
    PNG: {value: 'png'},
  });

  return composer.buildSchema({
    directives: initialSchema.getDirectives(),
  });
}

module.exports = buildSchema();
