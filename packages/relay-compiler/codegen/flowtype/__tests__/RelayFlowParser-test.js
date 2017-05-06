/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @fullSyntaxTransform
 * @format
 */

'use strict';

jest.autoMockOff();

const RelayTestSchema = require('RelayTestSchema');
const RelayFlowParser = require('RelayFlowParser');

const getGoldenMatchers = require('getGoldenMatchers');
const prettyStringify = require('prettyStringify');

describe('RelayFlowParser', () => {
  beforeEach(() => {
    jest.resetModules();
    jasmine.addMatchers(getGoldenMatchers(__filename));
  });

  it('matches expected output', () => {
    expect('fixtures/relay-flow-parser').toMatchGolden(text => {
      return prettyStringify(RelayFlowParser.parse(text, RelayTestSchema));
    });
  });
});
