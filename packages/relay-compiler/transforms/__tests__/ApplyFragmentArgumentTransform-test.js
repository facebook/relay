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

const ApplyFragmentArgumentTransform = require('../ApplyFragmentArgumentTransform');
const GraphQLCompilerContext = require('../../core/GraphQLCompilerContext');
const GraphQLIRPrinter = require('../../core/GraphQLIRPrinter');
const RelayParser = require('../../core/RelayParser');
const Schema = require('../../core/Schema');

const {
  TestSchema,
  generateTestsFromFixtures,
} = require('relay-test-utils-internal');

describe('ApplyFragmentArgumentTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/apply-fragment-argument-transform`,
    text => {
      const compilerSchema = Schema.DEPRECATED__create(TestSchema);
      const ast = RelayParser.parse(compilerSchema, text);
      return new GraphQLCompilerContext(compilerSchema)
        .addAll(ast)
        .applyTransforms([ApplyFragmentArgumentTransform.transform])
        .documents()
        .map(doc => GraphQLIRPrinter.print(compilerSchema, doc))
        .join('\n');
    },
  );
});
