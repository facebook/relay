/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const CompilerContext = require('../CompilerContext');
const IRPrinter = require('../IRPrinter');
const RelayParser = require('../RelayParser');

const {
  TestSchema,
  generateTestsFromFixtures,
} = require('relay-test-utils-internal');

describe('IRPrinter', () => {
  generateTestsFromFixtures(`${__dirname}/fixtures/printer`, text => {
    const ast = RelayParser.parse(TestSchema, text);
    const context = new CompilerContext(TestSchema).addAll(ast);
    const documents = [];
    context.forEachDocument(doc => {
      documents.push(IRPrinter.print(TestSchema, doc));
    });
    return documents.join('\n');
  });
});
