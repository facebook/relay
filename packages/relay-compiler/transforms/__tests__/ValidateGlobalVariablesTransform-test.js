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
const ValidateGlobalVariablesTransform = require('../ValidateGlobalVariablesTransform');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

generateTestsFromFixtures(
  `${__dirname}/fixtures/ValidateGlobalVariablesTransform`,
  text => {
    const {definitions, schema} = parseGraphQLText(TestSchema, text);
    return new CompilerContext(schema)
      .addAll(definitions)
      .applyTransforms([ValidateGlobalVariablesTransform.transform])
      .documents()
      .map(doc => `${doc.name}: NO ERRORS`)
      .join('\n');
  },
);
