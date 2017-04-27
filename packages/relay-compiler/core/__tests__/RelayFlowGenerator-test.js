/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

jest.disableAutomock();

const RelayCompilerContext = require('RelayCompilerContext');
const RelayFlowGenerator = require('RelayFlowGenerator');
const RelayTestSchema = require('RelayTestSchema');

const getGoldenMatchers = require('getGoldenMatchers');
const parseGraphQLText = require('parseGraphQLText');

describe('RelayFlowGenerator', () => {
  beforeEach(() => {
    jasmine.addMatchers(getGoldenMatchers(__filename));
  });

  it('matches expected output', () => {
    expect('fixtures/flow-generator').toMatchGolden(text => {
      const {definitions} = parseGraphQLText(RelayTestSchema, text);
      const context = (new RelayCompilerContext(RelayTestSchema)).addAll(definitions);
      return context.documents().map(
        doc => RelayFlowGenerator.generate(doc)
      ).join('\n\n');
    });
  });
});
