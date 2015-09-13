/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * Running this script from the base directory will regenerate
 * testschema.rfc.json from testschema.rfc.graphql
 */

var fs = require('fs');
var path = require('path');
var schema = require('graphql/language/schema');
var utilities = require('graphql/utilities');
var graphql = require('graphql');

try {
  var inFile = path.resolve(__dirname, '__tests__', 'testschema.rfc.graphql');
  var outFile = path.resolve(__dirname, '__tests__', 'testschema.rfc.json');

  var body = fs.readFileSync(inFile, 'utf8');
  var ast = schema.parseSchemaIntoAST(body);
  var astSchema = utilities.buildASTSchema(ast, 'Root', 'Mutation');
  graphql.graphql(astSchema, utilities.introspectionQuery).then(
    function(result) {
      var out = JSON.stringify(result, null, 2);
      fs.writeFileSync(outFile, out);
    });
} catch (error) {
  console.error(error);
  console.error(error.stack);
}
