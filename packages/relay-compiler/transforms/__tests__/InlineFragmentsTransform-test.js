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
const InlineFragmentsTransform = require('../InlineFragmentsTransform');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('InlineFragmentsTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/inline-fragments-transform`,
    text => {
      const {definitions} = parseGraphQLText(TestSchema, text);
      return new CompilerContext(TestSchema)
        .addAll(definitions)
        .applyTransforms([InlineFragmentsTransform.transform])
        .documents()
        .map(doc => IRPrinter.print(TestSchema, doc))
        .join('\n');
    },
  );
});
