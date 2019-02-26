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
const RefineOperationVariablesTransform = require('../RefineOperationVariablesTransform');
const RelayTestSchema = require('RelayTestSchema');

const parseGraphQLText = require('parseGraphQLText');

const {generateTestsFromFixtures} = require('RelayModernTestUtils');

describe('RefineOperationVariablesTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/refine-operation-variables-transform`,
    text => {
      const {definitions} = parseGraphQLText(RelayTestSchema, text);
      return new GraphQLCompilerContext(RelayTestSchema)
        .addAll(definitions)
        .applyTransforms([RefineOperationVariablesTransform.transform])
        .documents()
        .map(GraphQLIRPrinter.print)
        .join('\n');
    },
  );
});
