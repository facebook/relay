/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const GraphQLCompilerContext = require('GraphQLCompilerContext');
const GraphQLIRPrinter = require('GraphQLIRPrinter');
const RelayFieldHandleTransform = require('RelayFieldHandleTransform');
const RelayTestSchema = require('RelayTestSchema');

const parseGraphQLText = require('parseGraphQLText');

const {generateTestsFromFixtures} = require('RelayModernTestUtils');

describe('RelayFieldHandleTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/field-handle-transform`,
    text => {
      const {definitions} = parseGraphQLText(RelayTestSchema, text);
      return new GraphQLCompilerContext(RelayTestSchema)
        .addAll(definitions)
        .applyTransforms([RelayFieldHandleTransform.transform])
        .documents()
        .map(GraphQLIRPrinter.print)
        .join('\n');
    },
  );
});
