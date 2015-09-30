/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var path = require('path');
var readFixtures = require('../tools/readFixtures');
var transformGraphQL = require('../tools/transformGraphQL');

var FIXTURE_PATH = path.resolve(__dirname, '..', '__fixtures__');
var SCHEMA_PATH = path.resolve(__dirname, 'testschema.rfc.json');

var transform = transformGraphQL.bind(null, SCHEMA_PATH);

describe('getBabelRelayPlugin', function() {
  var fixtures = readFixtures(FIXTURE_PATH);

  Object.keys(fixtures).forEach(function(testName) {
    var fixture = fixtures[testName];
    if (fixture.output !== undefined) {
      var expected;
      try {
        expected = trimCode(transform(fixture.output, testName));
      } catch (e) {
        throw new Error(
          'Failed to transform output for `' + testName + '`:\n' +
          e.stack
        );
      }

      it('transforms GraphQL RFC for `' + testName + '`', function() {
        var actual = trimCode(transform(fixture.input, testName));
        expect('\n' + actual + '\n').toBe('\n' + expected + '\n');
      });
    } else {
      it('throws for GraphQL fixture: ' + testName, function() {
        expect(function() {
          transform(fixture.input, testName);
        }).toThrow(fixtures.error);
      });
    }
  });
});

function trimCode(code) {
  return code
    .replace(/\s*([\[\]\(\){};,=:])\s*/g, '$1')
    .replace(/;+/, ';')
    .replace(/\s+/g, ' ');
}
