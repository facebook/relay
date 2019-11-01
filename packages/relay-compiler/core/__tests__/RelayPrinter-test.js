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

'use strict';

const CompilerContext = require('../CompilerContext');
const IRPrinter = require('../IRPrinter');
const RelayParser = require('../RelayParser');
const Schema = require('../Schema');

const {
  TestSchema,
  generateTestsFromFixtures,
} = require('relay-test-utils-internal');

describe('IRPrinter', () => {
  generateTestsFromFixtures(`${__dirname}/fixtures/printer`, text => {
    const compilerSchema = Schema.DEPRECATED__create(TestSchema);
    const ast = RelayParser.parse(compilerSchema, text);
    const context = new CompilerContext(compilerSchema).addAll(ast);
    const documents = [];
    context.forEachDocument(doc => {
      documents.push(IRPrinter.print(compilerSchema, doc));
    });
    return documents.join('\n');
  });
});
