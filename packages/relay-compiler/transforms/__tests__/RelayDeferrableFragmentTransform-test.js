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
const RelayDeferrableFragmentTransform = require('RelayDeferrableFragmentTransform');
const RelayParser = require('RelayParser');
const RelayRelayDirectiveTransform = require('RelayRelayDirectiveTransform');
const RelayTestSchema = require('RelayTestSchema');

const {transformASTSchema} = require('ASTConvert');
const {generateTestsFromFixtures} = require('RelayModernTestUtils');

describe('RelayDeferrableFragmentTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/deferrable-fragment-transform`,
    text => {
      const schema = transformASTSchema(RelayTestSchema, [
        RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
      ]);
      const ast = RelayParser.parse(schema, text);
      const documents = new GraphQLCompilerContext(RelayTestSchema, schema)
        .addAll(ast)
        .applyTransforms([
          // Requires Relay directive transform first.
          RelayRelayDirectiveTransform.transform,
          RelayDeferrableFragmentTransform.transform,
        ])
        .documents();
      return (
        documents.map(GraphQLIRPrinter.print).join('\n') +
        '\n\n' +
        documents.map(doc => JSON.stringify(doc, null, 2)).join('\n')
      );
    },
  );
});
