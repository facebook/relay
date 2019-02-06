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
  const composer = new SchemaComposer();
  composer.addTypeDefs(fs.readFileSync(RelayTestSchemaPath, 'utf8'));

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

  return composer.buildSchema();
}

module.exports = buildSchema();
