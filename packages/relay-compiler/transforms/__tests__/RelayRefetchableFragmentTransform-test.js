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
const RelayConnectionTransform = require('../../handlers/connection/RelayConnectionTransform');
const RelayRefetchableFragmentTransform = require('../RelayRefetchableFragmentTransform');
const RelayRelayDirectiveTransform = require('../RelayRelayDirectiveTransform');

const {transformASTSchema} = require('../../core/ASTConvert');
const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('RelayRefetchableFragmentTransform', () => {
  const schema = transformASTSchema(TestSchema, [
    RelayConnectionTransform.SCHEMA_EXTENSION,
    RelayRefetchableFragmentTransform.SCHEMA_EXTENSION,
  ]);

  generateTestsFromFixtures(
    `${__dirname}/fixtures/relay-refetchable-fragment-transform`,
    text => {
      const {definitions} = parseGraphQLText(schema, text);
      return new GraphQLCompilerContext(TestSchema, schema)
        .addAll(definitions)
        .applyTransforms([
          // Requires Relay directive transform first.
          RelayRelayDirectiveTransform.transform,
          RelayConnectionTransform.transform,
          RelayRefetchableFragmentTransform.transform,
        ])
        .documents()
        .map(doc => GraphQLIRPrinter.print(doc))
        .join('\n');
    },
  );
});
