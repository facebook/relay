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

const GraphQLCompilerContext = require('GraphQLCompilerContext');
const GraphQLIRPrinter = require('GraphQLIRPrinter');
const RelayConnectionTransform = require('RelayConnectionTransform');
const RelayTestSchema = require('RelayTestSchema');

const parseGraphQLText = require('parseGraphQLText');

const {transformASTSchema} = require('ASTConvert');
const {generateTestsFromFixtures} = require('RelayModernTestUtils');

describe('RelayConnectionTransform', () => {
  generateTestsFromFixtures(`${__dirname}/fixtures`, text => {
    try {
      const schema = transformASTSchema(RelayTestSchema, [
        RelayConnectionTransform.SCHEMA_EXTENSION,
      ]);
      const {definitions} = parseGraphQLText(schema, text);
      return new GraphQLCompilerContext(RelayTestSchema, schema)
        .addAll(definitions)
        .applyTransforms([RelayConnectionTransform.transform])
        .documents()
        .map(
          doc =>
            GraphQLIRPrinter.print(doc) +
            '# Metadata:\n' +
            JSON.stringify(doc.metadata, null, 2),
        )
        .join('\n');
    } catch (error) {
      return error.message;
    }
  });
});
