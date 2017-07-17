/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
    expect('fixtures/parser').toMatchGolden(text =>
      prettyStringify(RelayParser.parse(RelayTestSchema, text)),
    );
  });
});
