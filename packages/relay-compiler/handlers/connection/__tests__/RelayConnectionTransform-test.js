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

require('configureForRelayOSS');

const GraphQLCompilerContext = require('GraphQLCompilerContext');
const RelayConnectionTransform = require('RelayConnectionTransform');
const GraphQLIRPrinter = require('GraphQLIRPrinter');
const RelayTestSchema = require('RelayTestSchema');
const {generateTestsFromFixtures} = require('RelayModernTestUtils');
const parseGraphQLText = require('parseGraphQLText');

const {transformASTSchema} = require('ASTConvert');

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
