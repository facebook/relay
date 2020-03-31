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
const MatchTransform = require('../MatchTransform');
const SkipSplitOperationTransform = require('../SkipSplitOperationTransform');
const SplitModuleImportTransform = require('../SplitModuleImportTransform');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('SkipSplitOperationTransform', () => {
  const extendedSchema = TestSchema.extend([MatchTransform.SCHEMA_EXTENSION]);
  generateTestsFromFixtures(
    `${__dirname}/fixtures/skip-split-opertion-transform`,
    text => {
      const {definitions} = parseGraphQLText(extendedSchema, text);

      return new CompilerContext(extendedSchema)
        .addAll(definitions)
        .applyTransforms([
          MatchTransform.transform,
          SplitModuleImportTransform.transform,
          SkipSplitOperationTransform.transform,
        ])
        .documents()
        .map(doc =>
          JSON.stringify(
            {
              kind: doc.kind,
              name: doc.name,
            },
            null,
            2,
          ),
        )
        .join('\n');
    },
  );
});
