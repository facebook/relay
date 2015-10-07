/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @fullSyntaxTransform
 */

'use strict';

var babel = require('babel-core');
var fs = require('fs');
var path = require('path');
var util = require('util');

var getBabelRelayPlugin = require('../getBabelRelayPlugin');

var _schemas = {};
function getSchema(schemaPath) {
  try {
    var schema = _schemas[schemaPath];
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
  var plugin = getBabelRelayPlugin(getSchema(schemaPath), {
    abortOnError: false,
    debug: true,
    suppressWarnings: true,
  });
  return babel.transform(source, {
    compact: false,
    filename: filename,
    plugins: [plugin],
    blacklist: ['strict'],
  }).code;
}

module.exports = transformGraphQL;
