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

const GraphQLCompilerContext = require('GraphQLCompilerContext');
const GraphQLIRPrinter = require('GraphQLIRPrinter');
const RelayTestSchema = require('RelayTestSchema');
const filterContextForNode = require('filterContextForNode');
const {generateTestsFromFixtures} = require('RelayModernTestUtils');
const parseGraphQLText = require('parseGraphQLText');

const MAIN_QUERY_NAME = 'MainQuery';

describe('filterContextForNode', () => {
  generateTestsFromFixtures(`${__dirname}/fixtures/filter-context`, text => {
    const {definitions} = parseGraphQLText(RelayTestSchema, text);
    const context = new GraphQLCompilerContext(RelayTestSchema).addAll(
      definitions,
    );
    const printerContext = filterContextForNode(
      context.get(MAIN_QUERY_NAME),
      context,
    );
    return printerContext
      .documents()
      .map(GraphQLIRPrinter.print)
      .join('\n');
  });
});
