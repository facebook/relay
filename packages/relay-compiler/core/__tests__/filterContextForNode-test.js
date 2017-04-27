/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

jest.autoMockOff();

require('configureForRelayOSS');

const RelayCompilerContext = require('RelayCompilerContext');
const RelayPrinter = require('RelayPrinter');
const RelayTestSchema = require('RelayTestSchema');
const filterContextForNode = require('filterContextForNode');
const getGoldenMatchers = require('getGoldenMatchers');
const parseGraphQLText = require('parseGraphQLText');

const MAIN_QUERY_NAME = 'MainQuery';

describe('filterContextForNode', () => {
  beforeEach(() => {
    jasmine.addMatchers(getGoldenMatchers(__filename));
  });

  it('matches expected output', () => {
    expect('fixtures/filter-context').toMatchGolden(text => {
      const {definitions} = parseGraphQLText(RelayTestSchema, text);
      const context = (new RelayCompilerContext(RelayTestSchema)).addAll(definitions);
      const printerContext = filterContextForNode(context.get(MAIN_QUERY_NAME), context);
      return printerContext.documents().map(RelayPrinter.print).join('\n');
    });
  });
});
