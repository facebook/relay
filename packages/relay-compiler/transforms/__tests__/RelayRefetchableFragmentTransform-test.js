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

const GraphQLCompilerContext = require('GraphQLCompilerContext');
const GraphQLIRPrinter = require('GraphQLIRPrinter');
const RelayConnectionTransform = require('RelayConnectionTransform');
const RelayRefetchableFragmentTransform = require('RelayRefetchableFragmentTransform');
const RelayRelayDirectiveTransform = require('RelayRelayDirectiveTransform');
const RelayTestSchema = require('RelayTestSchema');

const parseGraphQLText = require('parseGraphQLText');

const {transformASTSchema} = require('ASTConvert');
const {generateTestsFromFixtures} = require('RelayModernTestUtils');

describe('RelayRefetchableFragmentTransform', () => {
  const schema = transformASTSchema(RelayTestSchema, [
    RelayConnectionTransform.SCHEMA_EXTENSION,
    RelayRefetchableFragmentTransform.SCHEMA_EXTENSION,
  ]);

  generateTestsFromFixtures(
    `${__dirname}/fixtures/relay-refetchable-fragment-transform`,
    text => {
      const {definitions} = parseGraphQLText(schema, text);
      return new GraphQLCompilerContext(RelayTestSchema, schema)
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
