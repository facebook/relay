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

const ClientExtensionsTransform = require('../ClientExtensionsTransform');
const GraphQLCompilerContext = require('../../core/GraphQLCompilerContext');
const GraphQLIRPrinter = require('../../core/GraphQLIRPrinter');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('ClientExtensionsTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/client-extensions-transform`,
    text => {
      const {definitions, schema} = parseGraphQLText(TestSchema, text);
      return new GraphQLCompilerContext(TestSchema, schema)
        .addAll(definitions)
        .applyTransforms([ClientExtensionsTransform.transform])
        .documents()
        .map(GraphQLIRPrinter.print)
        .join('\n');
    },
  );
});
