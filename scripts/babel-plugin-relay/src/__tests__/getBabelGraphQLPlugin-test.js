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

const path = require('path');
const readFixtures = require('../tools/readFixtures');
const transformGraphQL = require('../tools/transformGraphQL');

const FIXTURE_PATTERN = process.env.FIXTURE;
const FIXTURE_PATH = path.resolve(__dirname, '..', '__fixtures__');
const SCHEMA_PATH = path.resolve(__dirname, 'testschema.rfc.json');

const transform = transformGraphQL.bind(null, SCHEMA_PATH);

const ConsoleErrorQueue = {
  print: console.error.bind(console),
  queue: [],
  clear() {
    ConsoleErrorQueue.queue = [];
  },
  enqueue(...args) {
    ConsoleErrorQueue.queue.push(args);
  },
  flush() {
    ConsoleErrorQueue.queue.forEach(args => {
      ConsoleErrorQueue.print(...args);
    });
  },
};

describe('getBabelRelayPlugin', () => {
  const fixtures = readFixtures(FIXTURE_PATH);

  // Only print debug errors if test fails.
  console.error = ConsoleErrorQueue.enqueue;

  Object.keys(fixtures).forEach(testName => {
    if (FIXTURE_PATTERN && testName.indexOf(FIXTURE_PATTERN) < 0) {
      return;
    }

    const fixture = fixtures[testName];
    if (fixture.output !== undefined) {
      let expected;
      try {
        expected = trimCode(transform(fixture.output, testName));
      } catch (e) {
        throw new Error(
          'Failed to transform output for `' + testName + '`:\n' +
          e.stack
        );
      }

      it('transforms GraphQL RFC for `' + testName + '`', () => {
        const actual = trimCode(transform(fixture.input, testName));
        if (actual !== expected) {
          ConsoleErrorQueue.flush();
          expect('\n' + actual + '\n').toBe('\n' + expected + '\n');
        }
        ConsoleErrorQueue.clear();
      });
    } else {
      it('throws for GraphQL fixture: ' + testName, () => {
        let expected;
        try {
          transform(fixture.input, testName);
        } catch (e) {
          expected = e;
        }
        if (!expected || expected.message !== fixtures.error.message) {
          ConsoleErrorQueue.flush();
          expect(() => {
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
  return code
    .replace(/\s*([\[\]\(\){};,=:])\s*/g, '$1')
    .replace(/;+/, ';')
    .replace(/\s+/g, ' ');
}
