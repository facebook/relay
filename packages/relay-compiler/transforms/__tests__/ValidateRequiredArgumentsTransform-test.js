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

// flowlint ambiguous-object-type:error

'use strict';

const CompilerContext = require('../../core/CompilerContext');
const RelayIRTransforms = require('../../core/RelayIRTransforms');

const validateRelayRequiredArguments = require('../ValidateRequiredArgumentsTransform');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');
describe('validateRelayRequiredArguments-test', () => {
  const relaySchema = TestSchema.extend(RelayIRTransforms.schemaExtensions);

  generateTestsFromFixtures(
    `${__dirname}/fixtures/required-arguments`,
    text => {
      const {definitions, schema} = parseGraphQLText(relaySchema, text);
      const codegenContext = new CompilerContext(schema)
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
