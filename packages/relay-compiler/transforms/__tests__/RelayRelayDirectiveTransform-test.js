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
const RelayParser = require('../../core/RelayParser');
const RelayRelayDirectiveTransform = require('../RelayRelayDirectiveTransform');

const {transformASTSchema} = require('../../core/ASTConvert');
const {
  TestSchema,
  generateTestsFromFixtures,
} = require('relay-test-utils-internal');

describe('RelayRelayDirectiveTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/relay-directive-transform`,
    text => {
      const schema = transformASTSchema(TestSchema, [
        RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
      ]);
      const ast = RelayParser.parse(schema, text);
      return new GraphQLCompilerContext(TestSchema, schema)
        .addAll(ast)
        .applyTransforms([RelayRelayDirectiveTransform.transform])
        .documents()
        .map(doc => JSON.stringify(doc, null, 2))
        .join('\n');
    },
  );
});
