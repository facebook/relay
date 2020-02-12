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
const ValidateUnusedVariablesTransform = require('../ValidateUnusedVariablesTransform');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

generateTestsFromFixtures(
  `${__dirname}/fixtures/ValidateUnusedVariablesTransform`,
  text => {
    const extendedSchema = TestSchema.extend([
      ValidateUnusedVariablesTransform.SCHEMA_EXTENSION,
    ]);
    const {definitions} = parseGraphQLText(extendedSchema, text);
    return new CompilerContext(extendedSchema)
      .addAll(definitions)
      .applyTransforms([ValidateUnusedVariablesTransform.transform])
      .documents()
      .map(doc => `${doc.name}: NO ERRORS.`)
      .join('\n');
  },
);
