/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @emails oncall+relay
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const CompilerContext = require('../../core/CompilerContext');
const IRPrinter = require('../../core/IRPrinter');
const MatchTransform = require('../MatchTransform');
const RelayDirectiveTransform = require('../RelayDirectiveTransform');
const SplitModuleImportTransform = require('../SplitModuleImportTransform');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('MatchTransform', () => {
  const extendedSchema = TestSchema.extend([MatchTransform.SCHEMA_EXTENSION]);

  generateTestsFromFixtures(
    `${__dirname}/fixtures/relay-split-module-import-transform`,
    text => {
      const {definitions} = parseGraphQLText(extendedSchema, text);
      return new CompilerContext(extendedSchema)
        .addAll(definitions)
        .applyTransforms([
          // Requires Relay directive transform first.
          RelayDirectiveTransform.transform,
          MatchTransform.transform,
          SplitModuleImportTransform.transform,
        ])
        .documents()
        .map(doc => IRPrinter.print(extendedSchema, doc))
        .join('\n');
    },
  );
});
