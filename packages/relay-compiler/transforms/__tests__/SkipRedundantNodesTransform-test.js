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
const RelayTestSchema = require('RelayTestSchema');
const SkipRedundantNodesTransform = require('../SkipRedundantNodesTransform');

const {generateTestsFromFixtures} = require('RelayModernTestUtils');

describe('SkipRedundantNodesTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/skip-redundant-nodes-transform`,
    text => {
      const ast = RelayParser.parse(RelayTestSchema, text);
      return new GraphQLCompilerContext(RelayTestSchema)
        .addAll(ast)
        .applyTransforms([SkipRedundantNodesTransform.transform])
        .documents()
        .map(GraphQLIRPrinter.print)
        .join('\n');
    },
  );
});
