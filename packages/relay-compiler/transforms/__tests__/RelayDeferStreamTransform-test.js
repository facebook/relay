/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

const GraphQLCompilerContext = require('../../core/GraphQLCompilerContext');
const GraphQLIRPrinter = require('../../core/GraphQLIRPrinter');
const RelayDeferStreamTransform = require('../RelayDeferStreamTransform');

const {transformASTSchema} = require('../../core/ASTConvert');
const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('RelayDeferStreamTransform', () => {
  const schema = transformASTSchema(TestSchema, []);

  describe('when streaming is enabled', () => {
    generateTestsFromFixtures(
      `${__dirname}/fixtures/relay-defer-stream-transform`,
      text => {
        const {definitions, schema: clientSchema} = parseGraphQLText(
          schema,
          text,
        );
        return new GraphQLCompilerContext(TestSchema, clientSchema)
          .addAll(definitions)
          .applyTransforms([RelayDeferStreamTransform.transform])
          .documents()
          .map(doc => GraphQLIRPrinter.print(doc))
          .join('\n');
      },
    );
  });
});
