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

const GraphQLCompilerContext = require('../../../core/GraphQLCompilerContext');
const GraphQLIRPrinter = require('../../../core/GraphQLIRPrinter');
const RelayConnectionTransform = require('../RelayConnectionTransform');

const {transformASTSchema} = require('../../../core/ASTConvert');
const {RelayFeatureFlags} = require('relay-runtime');
const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils');

describe('RelayConnectionTransform', () => {
  let previousEnableIncrementalDelivery;

  beforeEach(() => {
    previousEnableIncrementalDelivery =
      RelayFeatureFlags.ENABLE_INCREMENTAL_DELIVERY;
    RelayFeatureFlags.ENABLE_INCREMENTAL_DELIVERY = true;
  });

  afterEach(() => {
    RelayFeatureFlags.ENABLE_INCREMENTAL_DELIVERY = previousEnableIncrementalDelivery;
  });

  generateTestsFromFixtures(`${__dirname}/fixtures`, text => {
    const schema = transformASTSchema(TestSchema, [
      RelayConnectionTransform.SCHEMA_EXTENSION,
    ]);
    const {definitions} = parseGraphQLText(schema, text);
    return new GraphQLCompilerContext(TestSchema, schema)
      .addAll(definitions)
      .applyTransforms([RelayConnectionTransform.transform])
      .documents()
      .map(
        doc =>
          GraphQLIRPrinter.print(doc) +
          '# Metadata:\n' +
          JSON.stringify(doc.metadata, null, 2),
      )
      .join('\n');
  });
});
