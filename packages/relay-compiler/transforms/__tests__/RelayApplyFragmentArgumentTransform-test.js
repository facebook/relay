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
const RelayApplyFragmentArgumentTransform = require('../RelayApplyFragmentArgumentTransform');
const RelayParser = require('../../core/RelayParser');
const RelayTestSchema = require('RelayTestSchema');

const {generateTestsFromFixtures} = require('RelayModernTestUtils');

describe('RelayApplyFragmentArgumentTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/apply-fragment-argument-transform`,
    text => {
      const ast = RelayParser.parse(RelayTestSchema, text);
      return new GraphQLCompilerContext(RelayTestSchema)
        .addAll(ast)
        .applyTransforms([RelayApplyFragmentArgumentTransform.transform])
        .documents()
        .map(GraphQLIRPrinter.print)
        .join('\n');
    },
  );
});
