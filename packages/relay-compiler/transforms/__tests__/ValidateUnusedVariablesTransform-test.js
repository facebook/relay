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
const Schema = require('../../core/Schema');
const ValidateUnusedVariablesTransform = require('../ValidateUnusedVariablesTransform');

const {transformASTSchema} = require('../../core/ASTConvert');
const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

generateTestsFromFixtures(
  `${__dirname}/fixtures/ValidateUnusedVariablesTransform`,
  text => {
    const extendedSchema = transformASTSchema(TestSchema, [
      ValidateUnusedVariablesTransform.SCHEMA_EXTENSION,
    ]);
    const {definitions} = parseGraphQLText(extendedSchema, text);
    const compilerSchema = Schema.DEPRECATED__create(
      TestSchema,
      extendedSchema,
    );
    return new CompilerContext(compilerSchema)
      .addAll(definitions)
      .applyTransforms([ValidateUnusedVariablesTransform.transform])
      .documents()
      .map(doc => `${doc.name}: NO ERRORS.`)
      .join('\n');
  },
);
