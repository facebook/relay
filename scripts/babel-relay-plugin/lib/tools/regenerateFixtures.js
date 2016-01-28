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

var fs = require('fs');
var path = require('path');

var transformGraphQL = require('./transformGraphQL');
var readFixtures = require('./readFixtures');

var SRC_DIR = path.dirname(__dirname);

var FIXTURE_PATH = path.join(SRC_DIR, '__fixtures__');
var SCHEMA_PATH = path.join(SRC_DIR, '__tests__', './testschema.rfc.json');

function writeFixture(basename, text) {
  fs.writeFileSync(path.join(FIXTURE_PATH, basename), text, 'utf8');
}

var transform = transformGraphQL.bind(null, SCHEMA_PATH);

function genFixtures() {
  var fixtures = readFixtures(FIXTURE_PATH);
  Object.keys(fixtures).forEach(function (filename) {
    var fixture = fixtures[filename];
    if (fixture.output !== undefined) {
      // fixture for valid input, update the expected output
      try {
        var graphql = transform(fixture.input, filename);
        writeFixture(filename, ['Input:', fixture.input, '', // newline
        'Output:', graphql, '']. // newline
        join('\n'));
        console.log('Updated fixture `%s`.', filename);
      } catch (e) {
        console.error('Failed to transform fixture `%s`: %s: %s', filename, e.message, e.stack);
      }
    } // else: fixture for invalid code, nothing to update
  });
}

genFixtures();