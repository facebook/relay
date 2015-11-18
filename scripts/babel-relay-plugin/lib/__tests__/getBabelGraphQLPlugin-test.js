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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var path = require('path');
var readFixtures = require('../tools/readFixtures');
var transformGraphQL = require('../tools/transformGraphQL');

var FIXTURE_PATTERN = process.env.FIXTURE;
var FIXTURE_PATH = path.resolve(__dirname, '..', '..', 'src', '__fixtures__');
var SCHEMA_PATH = path.resolve(__dirname, '..', '..', 'src', '__tests__', 'testschema.rfc.json');

var transform = transformGraphQL.bind(null, SCHEMA_PATH);

var ConsoleErrorQueue = {
  print: console.error.bind(console),
  queue: [],
  clear: function clear() {
    ConsoleErrorQueue.queue = [];
  },
  enqueue: function enqueue() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    ConsoleErrorQueue.queue.push(args);
  },
  flush: function flush() {
    ConsoleErrorQueue.queue.forEach(function (args) {
      ConsoleErrorQueue.print.apply(ConsoleErrorQueue, _toConsumableArray(args));
    });
  }
};

describe('getBabelRelayPlugin', function () {
  var fixtures = readFixtures(FIXTURE_PATH);

  // Only print debug errors if test fails.
  console.error = ConsoleErrorQueue.enqueue;

  Object.keys(fixtures).forEach(function (testName) {
    if (FIXTURE_PATTERN && testName.indexOf(FIXTURE_PATTERN) < 0) {
      return;
    }

    var fixture = fixtures[testName];
    if (fixture.output !== undefined) {
      (function () {
        var expected = undefined;
        try {
          expected = trimCode(transform(fixture.output, testName));
        } catch (e) {
          throw new Error('Failed to transform output for `' + testName + '`:\n' + e.stack);
        }

        it('transforms GraphQL RFC for `' + testName + '`', function () {
          var actual = trimCode(transform(fixture.input, testName));
          if (actual !== expected) {
            ConsoleErrorQueue.flush();
            expect('\n' + actual + '\n').toBe('\n' + expected + '\n');
          }
          ConsoleErrorQueue.clear();
        });
      })();
    } else {
      it('throws for GraphQL fixture: ' + testName, function () {
        var expected = undefined;
        try {
          transform(fixture.input, testName);
        } catch (e) {
          expected = e;
        }
        if (!expected || expected.message !== fixtures.error.message) {
          ConsoleErrorQueue.flush();
          expect(function () {
            if (expected) {
              throw expected;
            }
          }).toThrow(fixtures.error);
        }
        ConsoleErrorQueue.clear();
      });
    }
  });
});

function trimCode(code) {
  return code.replace(/\s*([\[\]\(\){};,=:])\s*/g, '$1').replace(/;+/, ';').replace(/\s+/g, ' ');
}