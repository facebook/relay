/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

'use strict';

const GraphQLCompilerContext = require('../../core/GraphQLCompilerContext');
const RelayIRTransforms = require('../../core/RelayIRTransforms');
const Schema = require('../../core/Schema');

const validateRelayRequiredArguments = require('../validateRelayRequiredArguments');

const {transformASTSchema} = require('../../core/ASTConvert');
const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');
describe('validateRelayRequiredArguments-test', () => {
  const relaySchema = transformASTSchema(
    TestSchema,
    RelayIRTransforms.schemaExtensions,
  );

  generateTestsFromFixtures(
    `${__dirname}/fixtures/required-arguments`,
    text => {
      const {definitions} = parseGraphQLText(relaySchema, text);
      const codegenContext = new GraphQLCompilerContext(
        Schema.DEPRECATED__create(TestSchema, relaySchema),
      )
        .addAll(definitions)
        .applyTransforms([
          ...RelayIRTransforms.commonTransforms,
          ...RelayIRTransforms.queryTransforms,
          ...RelayIRTransforms.printTransforms,
        ]);
      validateRelayRequiredArguments(codegenContext);
      return 'PASSED';
    },
  );
});
