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
const RelayParser = require('RelayParser');
const GraphQLIRPrinter = require('GraphQLIRPrinter');
const RelayTestSchema = require('RelayTestSchema');
const {generateTestsFromFixtures} = require('RelayModernTestUtils');

describe('GraphQLIRPrinter', () => {
  generateTestsFromFixtures(`${__dirname}/fixtures/printer`, text => {
    const ast = RelayParser.parse(RelayTestSchema, text);
    const context = new GraphQLCompilerContext(RelayTestSchema).addAll(ast);
    const documents = [];
    context.forEachDocument(doc => {
      documents.push(GraphQLIRPrinter.print(doc));
    });
    return documents.join('\n');
  });
});
