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
const IRPrinter = require('../../core/IRPrinter');
const InlineFragmentsTransform = require('../InlineFragmentsTransform');
const MatchTransform = require('../MatchTransform');
const RelayDirectiveTransform = require('../RelayDirectiveTransform');
const SkipRedundantNodesTransform = require('../SkipRedundantNodesTransform');

const {
  TestSchema,
  parseGraphQLText,
  generateTestsFromFixtures,
} = require('relay-test-utils-internal');

describe('SkipRedundantNodesTransform', () => {
  const extendedSchema = TestSchema.extend([MatchTransform.SCHEMA_EXTENSION]);
  generateTestsFromFixtures(
    `${__dirname}/fixtures/skip-redundant-nodes-transform`,
    text => {
      const {definitions} = parseGraphQLText(extendedSchema, text);
      return new CompilerContext(extendedSchema)
        .addAll(definitions)
        .applyTransforms([
          RelayDirectiveTransform.transform,
          MatchTransform.transform,
          InlineFragmentsTransform.transform,
          SkipRedundantNodesTransform.transform,
        ])
        .documents()
        .map(doc => IRPrinter.print(extendedSchema, doc))
        .join('\n');
    },
  );
});
