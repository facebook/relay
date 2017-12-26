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

describe('RelayParser', () => {
  beforeEach(() => {
    expect.extend(getGoldenMatchers(__filename));
  });

  it('matches expected output', () => {
    expect('fixtures/parser').toMatchGolden(text => {
      try {
        const ir = RelayParser.parse(RelayTestSchema, text);
        return JSON.stringify(ir, null, 2);
      } catch (e) {
        return 'ERROR:\n' + e;
      }
    });
  });
});
