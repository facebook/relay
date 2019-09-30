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

const GraphQLCompilerContext = require('../../core/GraphQLCompilerContext');
const RelayParser = require('../../core/RelayParser');
const RelayTestOperationTransform = require('../RelayTestOperationTransform');
const Schema = require('../../core/Schema');

const {transformASTSchema} = require('../../core/ASTConvert');
const {
  TestSchema,
  generateTestsFromFixtures,
} = require('relay-test-utils-internal');

describe('RelayTestOperationTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/relay-test-operation`,
    text => {
      const schema = transformASTSchema(TestSchema, [
        RelayTestOperationTransform.SCHEMA_EXTENSION,
      ]);
      const compilerSchema = Schema.DEPRECATED__create(TestSchema, schema);
      const ast = RelayParser.parse(compilerSchema, text);
      return new GraphQLCompilerContext(compilerSchema)
        .addAll(ast)
        .applyTransforms([RelayTestOperationTransform.transform])
        .documents()
        .map(doc => JSON.stringify(doc, null, 2))
        .join('\n');
    },
  );
});
