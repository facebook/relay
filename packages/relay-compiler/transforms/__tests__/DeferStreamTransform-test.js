/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @emails oncall+relay
 * @format
 */

'use strict';

const ConnectionTransform = require('../ConnectionTransform');
const DeferStreamTransform = require('../DeferStreamTransform');
const GraphQLCompilerContext = require('../../core/GraphQLCompilerContext');
const GraphQLIRPrinter = require('../../core/GraphQLIRPrinter');
const Schema = require('../../core/Schema');

const {transformASTSchema} = require('../../core/ASTConvert');
const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('DeferStreamTransform', () => {
  const extendedSchema = transformASTSchema(TestSchema, [
    ConnectionTransform.SCHEMA_EXTENSION,
  ]);

  describe('when streaming is enabled', () => {
    generateTestsFromFixtures(
      `${__dirname}/fixtures/relay-defer-stream-transform`,
      text => {
        const {definitions} = parseGraphQLText(extendedSchema, text);
        const compilerSchema = Schema.DEPRECATED__create(
          TestSchema,
          extendedSchema,
        );
        return new GraphQLCompilerContext(compilerSchema)
          .addAll(definitions)
          .applyTransforms([
            ConnectionTransform.transform,
            DeferStreamTransform.transform,
          ])
          .documents()
          .map(doc => GraphQLIRPrinter.print(compilerSchema, doc))
          .join('\n');
      },
    );
  });
});
