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
const GraphQLIRPrinter = require('../../core/GraphQLIRPrinter');
const RelaySkipHandleFieldTransform = require('../RelaySkipHandleFieldTransform');
const Schema = require('../../core/Schema');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('RelaySkipHandleFieldTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/skip-handle-field-transform`,
    text => {
      const {definitions} = parseGraphQLText(TestSchema, text);
      const compilerSchema = Schema.DEPRECATED__create(TestSchema);
      return new GraphQLCompilerContext(compilerSchema)
        .addAll(definitions)
        .applyTransforms([RelaySkipHandleFieldTransform.transform])
        .documents()
        .map(doc => GraphQLIRPrinter.print(compilerSchema, doc))
        .join('\n');
    },
  );
});
