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

const GraphQLCompilerContext = require('../../core/GraphQLCompilerContext');
const GraphQLIRPrinter = require('../../core/GraphQLIRPrinter');
const InlineFragmentsTransform = require('../InlineFragmentsTransform');
const RelayMatchTransform = require('../RelayMatchTransform');
const RelayRelayDirectiveTransform = require('../RelayRelayDirectiveTransform');
const SkipRedundantNodesTransform = require('../SkipRedundantNodesTransform');

const {transformASTSchema} = require('../../core/ASTConvert');
const {
  TestSchema,
  parseGraphQLText,
  generateTestsFromFixtures,
} = require('relay-test-utils-internal');

describe('SkipRedundantNodesTransform', () => {
  const schema = transformASTSchema(TestSchema, [
    RelayMatchTransform.SCHEMA_EXTENSION,
  ]);
  generateTestsFromFixtures(
    `${__dirname}/fixtures/skip-redundant-nodes-transform`,
    text => {
      const {definitions, schema: clientSchema} = parseGraphQLText(
        schema,
        text,
      );
      return new GraphQLCompilerContext(TestSchema, clientSchema)
        .addAll(definitions)
        .applyTransforms([
          RelayRelayDirectiveTransform.transform,
          RelayMatchTransform.transform,
          InlineFragmentsTransform.transform,
          SkipRedundantNodesTransform.transform,
        ])
        .documents()
        .map(GraphQLIRPrinter.print)
        .join('\n');
    },
  );
});
