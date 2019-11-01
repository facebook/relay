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

const CompilerContext = require('../../core/CompilerContext');
const RelayParser = require('../../core/RelayParser');
const Schema = require('../../core/Schema');
const TestOperationTransform = require('../TestOperationTransform');

const {transformASTSchema} = require('../../core/ASTConvert');
const {
  TestSchema,
  generateTestsFromFixtures,
  printAST,
} = require('relay-test-utils-internal');

describe('TestOperationTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/relay-test-operation`,
    text => {
      const schema = transformASTSchema(TestSchema, [
        TestOperationTransform.SCHEMA_EXTENSION,
      ]);
      const compilerSchema = Schema.DEPRECATED__create(TestSchema, schema);
      const ast = RelayParser.parse(compilerSchema, text);
      return new CompilerContext(compilerSchema)
        .addAll(ast)
        .applyTransforms([TestOperationTransform.transform])
        .documents()
        .map(doc => printAST(doc))
        .join('\n');
    },
  );
});
