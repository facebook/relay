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
const FilterCompilerDirectivesTransform = require('../FilterCompilerDirectivesTransform');
const IRPrinter = require('../../core/IRPrinter');
const RelayIRTransforms = require('../../core/RelayIRTransforms');

const {RelayFeatureFlags} = require('relay-runtime');
const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('FilterCompilerDirectivesTransform', () => {
  beforeEach(() => {
    RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = true;
  });

  afterEach(() => {
    RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = false;
  });
  generateTestsFromFixtures(
    `${__dirname}/fixtures/filter-compiler-directives-transform`,
    text => {
      const relaySchema = TestSchema.extend(RelayIRTransforms.schemaExtensions);
      const {definitions} = parseGraphQLText(relaySchema, text);

      return new CompilerContext(relaySchema)
        .addAll(definitions)
        .applyTransforms([FilterCompilerDirectivesTransform.transform])
        .documents()
        .map(doc => IRPrinter.print(relaySchema, doc))
        .join('\n');
    },
  );
});
