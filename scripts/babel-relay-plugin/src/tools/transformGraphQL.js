/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @fullSyntaxTransform
 */

'use strict';

const babel = require('babel-core');
const fbjsPreset = require('babel-preset-fbjs');
const fs = require('fs');
const util = require('util');

const getBabelRelayPlugin = require('../getBabelRelayPlugin');

const _schemas = {};
function getSchema(schemaPath) {
  try {
    let schema = _schemas[schemaPath];
    if (!schema) {
      schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8')).data;
      _schemas[schemaPath] = schema;
    }
    return schema;
  } catch (e) {
    throw new Error(util.format(
      'transformGraphQL(): Failed to read schema path `%s`. Error: %s, %s',
       schemaPath,
       e.message,
       e.stack
    ));
  }
}

function transformGraphQL(schemaPath, source, filename) {
  const babelPluginRelay = getBabelRelayPlugin(getSchema(schemaPath), {
    debug: true,
    substituteVariables: true,
    suppressWarnings: true,
  });
  const options = {
    presets: [fbjsPreset],
    plugins: [babelPluginRelay],
    compact: false,
    filename,
  };
  return babel.transform(source, options).code;
}

module.exports = transformGraphQL;
