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
const RelayIRTransforms = require('../../core/RelayIRTransforms');

const validateRelayRequiredArugments = require('../validateRelayRequiredArugments');

const {transformASTSchema} = require('../../core/ASTConvert');
const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');
describe('validateRelayRequiredArugments-test', () => {
  const relaySchema = transformASTSchema(
    TestSchema,
    RelayIRTransforms.schemaExtensions,
  );

  generateTestsFromFixtures(
    `${__dirname}/fixtures/required-arguments`,
    text => {
      const {definitions, schema} = parseGraphQLText(relaySchema, text);
      const codegenContext = new GraphQLCompilerContext(TestSchema, schema)
        .addAll(definitions)
        .applyTransforms([
          ...RelayIRTransforms.commonTransforms,
          ...RelayIRTransforms.queryTransforms,
          ...RelayIRTransforms.printTransforms,
        ]);
      validateRelayRequiredArugments(codegenContext);
      return 'PASSED';
    },
  );
});
