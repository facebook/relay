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

const ClientExtensionsTransform = require('../ClientExtensionsTransform');
const GraphQLCompilerContext = require('../../core/GraphQLCompilerContext');
const GraphQLIRPrinter = require('../../core/GraphQLIRPrinter');
const RelayDeferStreamTransform = require('../RelayDeferStreamTransform');
const RelayDirectiveClientExtensionValidationTransform = require('../RelayDirectiveClientExtensionValidationTransform');

const {transformASTSchema} = require('../../core/ASTConvert');
const {RelayFeatureFlags} = require('relay-runtime');
const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils');

describe('RelayDeferStreamTransform', () => {
  const schema = transformASTSchema(TestSchema, []);

  describe('when streaming is enabled', () => {
    let previousEnableIncrementalDelivery;

    beforeEach(() => {
      previousEnableIncrementalDelivery =
        RelayFeatureFlags.ENABLE_INCREMENTAL_DELIVERY;
      RelayFeatureFlags.ENABLE_INCREMENTAL_DELIVERY = true;
    });

    afterEach(() => {
      RelayFeatureFlags.ENABLE_INCREMENTAL_DELIVERY = previousEnableIncrementalDelivery;
    });

    generateTestsFromFixtures(
      `${__dirname}/fixtures/relay-defer-stream-transform`,
      text => {
        const {definitions, schema: clientSchema} = parseGraphQLText(
          schema,
          text,
        );
        return new GraphQLCompilerContext(TestSchema, clientSchema)
          .addAll(definitions)
          .applyTransforms([
            ClientExtensionsTransform.transform,
            RelayDirectiveClientExtensionValidationTransform.transform,
            RelayDeferStreamTransform.transform,
          ])
          .documents()
          .map(doc => GraphQLIRPrinter.print(doc))
          .join('\n');
      },
    );
  });

  describe('when streaming is disabled', () => {
    describe('it transform queries', () => {
      generateTestsFromFixtures(
        `${__dirname}/fixtures/relay-defer-stream-transform-disabled`,
        text => {
          const {definitions} = parseGraphQLText(schema, text);
          return new GraphQLCompilerContext(TestSchema, schema)
            .addAll(definitions)
            .applyTransforms([RelayDeferStreamTransform.transform])
            .documents()
            .map(doc => GraphQLIRPrinter.print(doc))
            .join('\n');
        },
      );
    });
  });
});
