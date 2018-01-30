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
const RelayTestSchema = require('RelayTestSchema');
const SkipClientFieldTransform = require('SkipClientFieldTransform');

const parseGraphQLText = require('parseGraphQLText');

const {generateTestsFromFixtures} = require('RelayModernTestUtils');

describe('SkipClientFieldTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/skip-client-field-transform`,
    text => {
      const {definitions, schema} = parseGraphQLText(RelayTestSchema, text);
      return new GraphQLCompilerContext(RelayTestSchema, schema)
        .addAll(definitions)
        .applyTransforms([SkipClientFieldTransform.transform])
        .documents()
        .map(GraphQLIRPrinter.print)
        .join('\n');
    },
  );
});
