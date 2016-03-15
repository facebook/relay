// @generated
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

var babel = require('babel-core');
var fs = require('fs');
var util = require('util');

var getBabelRelayPlugin = require('../getBabelRelayPlugin');

var schemaCache = {};
function getSchema(schemaPath) {
  try {
    var schema = schemaCache[schemaPath];
    if (!schema) {
      schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8')).data;
      schemaCache[schemaPath] = schema;
    }
    return schema;
  } catch (e) {
    throw new Error(util.format('transformGraphQL(): Failed to read schema path `%s`. Error: %s, %s', schemaPath, e.message, e.stack));
  }
}

function transformGraphQL(schemaPath, source, filename) {
  var relayPlugin = getBabelRelayPlugin(getSchema(schemaPath), {
    debug: true,
    substituteVariables: true,
    suppressWarnings: true
  });
  return babel.transform(source, {
    plugins: [relayPlugin],
    compact: false,
    filename: filename
  }).code;
}

module.exports = transformGraphQL;