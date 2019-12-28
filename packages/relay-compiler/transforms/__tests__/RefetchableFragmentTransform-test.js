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
const ConnectionTransform = require('../ConnectionTransform');
const IRPrinter = require('../../core/IRPrinter');
const RefetchableFragmentTransform = require('../RefetchableFragmentTransform');
const RelayDirectiveTransform = require('../RelayDirectiveTransform');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('RefetchableFragmentTransform', () => {
  const extendedSchema = TestSchema.extend([
    ConnectionTransform.SCHEMA_EXTENSION,
    RefetchableFragmentTransform.SCHEMA_EXTENSION,
  ]);

  generateTestsFromFixtures(
    `${__dirname}/fixtures/relay-refetchable-fragment-transform`,
    text => {
      const {definitions} = parseGraphQLText(extendedSchema, text);
      return new CompilerContext(extendedSchema)
        .addAll(definitions)
        .applyTransforms([
          // Requires Relay directive transform first.
          RelayDirectiveTransform.transform,
          ConnectionTransform.transform,
          RefetchableFragmentTransform.transform,
        ])
        .documents()
        .map(doc => IRPrinter.print(extendedSchema, doc))
        .join('\n');
    },
  );
});
