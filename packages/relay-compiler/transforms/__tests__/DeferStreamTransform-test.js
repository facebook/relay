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
const DeferStreamTransform = require('../DeferStreamTransform');
const IRPrinter = require('../../core/IRPrinter');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('DeferStreamTransform', () => {
  const extendedSchema = TestSchema.extend([
    ConnectionTransform.SCHEMA_EXTENSION,
  ]);

  describe('when streaming is enabled', () => {
    generateTestsFromFixtures(
      `${__dirname}/fixtures/relay-defer-stream-transform`,
      text => {
        const {definitions} = parseGraphQLText(extendedSchema, text);
        return new CompilerContext(extendedSchema)
          .addAll(definitions)
          .applyTransforms([
            ConnectionTransform.transform,
            DeferStreamTransform.transform,
          ])
          .documents()
          .map(doc => IRPrinter.print(extendedSchema, doc))
          .join('\n');
      },
    );
  });
});
