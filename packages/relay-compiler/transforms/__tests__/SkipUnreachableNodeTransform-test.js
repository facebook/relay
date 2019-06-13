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
const RelayParser = require('../../core/RelayParser');
const SkipUnreachableNodeTransform = require('../SkipUnreachableNodeTransform');

const {
  TestSchema,
  generateTestsFromFixtures,
} = require('relay-test-utils-internal');

describe('SkipUnreachableNodeTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/skip-unreachable-node-transform`,
    text => {
      const ast = RelayParser.parse(TestSchema, text);
      return new GraphQLCompilerContext(TestSchema)
        .addAll(ast)
        .applyTransforms([SkipUnreachableNodeTransform.transform])
        .documents()
        .map(GraphQLIRPrinter.print)
        .join('\n');
    },
  );
});
