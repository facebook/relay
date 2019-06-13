/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const GraphQLCompilerContext = require('../GraphQLCompilerContext');
const GraphQLIRPrinter = require('../GraphQLIRPrinter');
const RelayParser = require('../RelayParser');

const {
  TestSchema,
  generateTestsFromFixtures,
} = require('relay-test-utils-internal');

describe('GraphQLIRPrinter', () => {
  generateTestsFromFixtures(`${__dirname}/fixtures/printer`, text => {
    const ast = RelayParser.parse(TestSchema, text);
    const context = new GraphQLCompilerContext(TestSchema).addAll(ast);
    const documents = [];
    context.forEachDocument(doc => {
      documents.push(GraphQLIRPrinter.print(doc));
    });
    return documents.join('\n');
  });
});
