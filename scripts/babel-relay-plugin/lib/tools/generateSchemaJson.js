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

/**
 * Generates `testschema.rfc.json` from `testschema.rfc.graphql`.
 */

var fs = require('fs');
var graphql = require('graphql');
var language = require('graphql/language');
var path = require('path');
var utilities = require('graphql/utilities');

var TESTS_DIR = path.resolve(__dirname, '..', '__tests__');

try {
  var inFile = path.join(TESTS_DIR, 'testschema.rfc.graphql');
  var outFile = path.join(TESTS_DIR, 'testschema.rfc.json');

  var body = fs.readFileSync(inFile, 'utf8');
  var ast = language.parse(body);
  var astSchema = utilities.buildASTSchema(ast);
  graphql.graphql(astSchema, utilities.introspectionQuery).then(function (result) {
    var out = JSON.stringify(result, null, 2);
    fs.writeFileSync(outFile, out);
  });
} catch (error) {
  console.error(error);
  console.error(error.stack);
}