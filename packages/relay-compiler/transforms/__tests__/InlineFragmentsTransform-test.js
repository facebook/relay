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
const InlineFragmentsTransform = require('../InlineFragmentsTransform');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('InlineFragmentsTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/inline-fragments-transform`,
    text => {
      const {schema, definitions} = parseGraphQLText(TestSchema, text);
      return new GraphQLCompilerContext(TestSchema, schema)
        .addAll(definitions)
        .applyTransforms([InlineFragmentsTransform.transform])
        .documents()
        .map(doc => GraphQLIRPrinter.print(doc))
        .join('\n');
    },
  );
});
