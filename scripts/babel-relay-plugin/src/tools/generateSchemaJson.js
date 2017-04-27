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

const fs = require('fs');
const graphql = require('graphql');
const language = require('graphql/language');
const path = require('path');
const utilities = require('graphql/utilities');

const TESTS_DIR = path.resolve(__dirname, '..', '__tests__');

try {
  const inFile = path.join(TESTS_DIR, 'testschema.rfc.graphql');
  const outFile = path.join(TESTS_DIR, 'testschema.rfc.json');

  const body = fs.readFileSync(inFile, 'utf8');
  const ast = language.parse(body);
  const astSchema = utilities.buildASTSchema(ast);
  graphql.graphql(astSchema, utilities.introspectionQuery).then(
    function(result) {
      const out = JSON.stringify(result, null, 2);
      fs.writeFileSync(outFile, out);
    });
} catch (error) {
  console.error(error);
  console.error(error.stack);
}
