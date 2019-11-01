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

const CompilerContext = require('../../core/CompilerContext');
const RelayIRTransforms = require('../../core/RelayIRTransforms');
const Schema = require('../../core/Schema');

const validateRelayRequiredArguments = require('../ValidateRequiredArgumentsTransform');

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
      const codegenContext = new CompilerContext(
        Schema.DEPRECATED__create(TestSchema, relaySchema),
      )
        .addAll(definitions)
        .applyTransforms([
          ...RelayIRTransforms.commonTransforms,
          ...RelayIRTransforms.queryTransforms,
          ...RelayIRTransforms.printTransforms,
        ]);
      // This should be an identity transform, just throw on errors.
      expect(validateRelayRequiredArguments.transform(codegenContext)).toBe(
        codegenContext,
      );
      return 'PASSED';
    },
  );
});
