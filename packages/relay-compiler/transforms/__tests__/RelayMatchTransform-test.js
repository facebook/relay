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

const ClientExtensionsTransform = require('../ClientExtensionsTransform');
const GraphQLCompilerContext = require('../../core/GraphQLCompilerContext');
const GraphQLIRPrinter = require('../../core/GraphQLIRPrinter');
const RelayMatchTransform = require('../RelayMatchTransform');
const RelayRelayDirectiveTransform = require('../RelayRelayDirectiveTransform');

const {transformASTSchema} = require('../../core/ASTConvert');
const {extendSchema, parse} = require('graphql');
const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils');

describe('RelayMatchTransform', () => {
  const schema = transformASTSchema(TestSchema, [
    RelayMatchTransform.SCHEMA_EXTENSION,
  ]);
  const EXTEND_CLIENT_SCHEMA = `
  fragment TestUserNameRenderer_name on TestUserNameRenderer {
    test
  }
  type TestUserNameRenderer {
    test: String
    user: User
    js(module: String): JSDependency
    name: String
  }
  `;
  const ast = parse(EXTEND_CLIENT_SCHEMA);
  generateTestsFromFixtures(
    `${__dirname}/fixtures/relay-match-transform`,
    text => {
      const {definitions} = parseGraphQLText(schema, text);
      return new GraphQLCompilerContext(
        TestSchema,
        extendSchema(schema, ast, {assumeValid: true}),
      )
        .addAll(definitions)
        .applyTransforms([
          // Requires Relay directive transform first.
          RelayRelayDirectiveTransform.transform,
          ClientExtensionsTransform.transform,
          RelayMatchTransform.transform,
        ])
        .documents()
        .map(GraphQLIRPrinter.print)
        .join('\n');
    },
  );
});
