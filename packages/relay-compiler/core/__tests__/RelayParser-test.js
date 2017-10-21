/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

require('configureForRelayOSS');

const RelayParser = require('RelayParser');
const RelayTestSchema = require('RelayTestSchema');
const getGoldenMatchers = require('getGoldenMatchers');
const prettyStringify = require('prettyStringify');

describe('RelayParser', () => {
  beforeEach(() => {
    expect.extend(getGoldenMatchers(__filename));
  });

  it('matches expected output', () => {
    expect('fixtures/parser').toMatchGolden(text => {
      try {
        return prettyStringify(RelayParser.parse(RelayTestSchema, text));
      } catch (e) {
        return 'ERROR:\n' + e;
      }
    });
  });
});
