/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+relay
 */

'use strict';

var path = require('path');
var readFixtures = require('../readFixtures');
var transformGraphQL = require('../transformGraphQL');

var SCHEMA_PATH = path.resolve(__dirname, './testschema.rfc.json');

var transform = transformGraphQL.bind(null, SCHEMA_PATH);

describe('getBabelRelayPlugin', function() {
  var fixtures = readFixtures();

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
