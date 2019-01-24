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

const GraphQLCompilerContext = require('GraphQLCompilerContext');
const GraphQLIRPrinter = require('GraphQLIRPrinter');
const RelayDeferStreamTransform = require('../RelayDeferStreamTransform');
const RelayTestSchema = require('RelayTestSchema');

const parseGraphQLText = require('parseGraphQLText');

const {transformASTSchema} = require('ASTConvert');
const {generateTestsFromFixtures} = require('RelayModernTestUtils');

describe('RelayDeferStreamTransform', () => {
  const schema = transformASTSchema(RelayTestSchema, []);

  generateTestsFromFixtures(
    `${__dirname}/fixtures/relay-defer-stream-transform`,
    text => {
      const {definitions} = parseGraphQLText(schema, text);
      return new GraphQLCompilerContext(RelayTestSchema, schema)
        .addAll(definitions)
        .applyTransforms([RelayDeferStreamTransform.transform])
        .documents()
        .map(doc => GraphQLIRPrinter.print(doc))
        .join('\n');
    },
  );
});
