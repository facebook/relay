/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const getOutputForFixture = require('./getOutputForFixture');
const fs = require('fs');
const path = require('path');

/* global expect,test */

/**
 * Extend Jest with a custom snapshot serializer to provide additional context
 * and reduce the amount of escaping that occurs.
 */
const FIXTURE_TAG = Symbol.for('FIXTURE_TAG');
expect.addSnapshotSerializer({
  print(value) {
    return Object.keys(value)
      .map(key => `~~~~~~~~~~ ${key.toUpperCase()} ~~~~~~~~~~\n${value[key]}`)
      .join('\n');
  },
  test(value) {
    return value && value[FIXTURE_TAG] === true;
  },
});

/**
 * Generates a set of jest snapshot tests that compare the output of the
 * provided `operation` to each of the matching files in the `fixturesPath`.
 * The fixture should have '# expected-to-throw' on its first line
 * if it is expected to fail
 */
function generateTestsFromFixtures(
  fixturesPath: string,
  operation: (input: string) => string,
): void {
  let fixtures = fs.readdirSync(fixturesPath);

  test(`has fixtures in ${fixturesPath}`, () => {
    expect(fixtures.length > 0).toBe(true);
  });

  const onlyFixtures = fixtures.filter(name => name.startsWith('only.'));
  if (onlyFixtures.length) {
    test.skip.each(fixtures.filter(name => !name.startsWith('only.')))(
      'matches expected output: %s',
      () => {},
    );
    fixtures = onlyFixtures;
  }
  test.each(fixtures)('matches expected output: %s', file => {
    const input = fs.readFileSync(path.join(fixturesPath, file), 'utf8');
    const output = getOutputForFixture(input, operation, file);
    expect({
      [FIXTURE_TAG]: true,
      input,
      output,
    }).toMatchSnapshot();
  });
}

module.exports = {
  generateTestsFromFixtures,
  FIXTURE_TAG,
};
