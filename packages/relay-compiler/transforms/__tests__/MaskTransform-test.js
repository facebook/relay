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
const MaskTransform = require('../MaskTransform');
const RelayDirectiveTransform = require('../RelayDirectiveTransform');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('MaskTransform', () => {
  const extendedSchema = TestSchema.extend([
    RelayDirectiveTransform.SCHEMA_EXTENSION,
  ]);

  generateTestsFromFixtures(
    `${__dirname}/fixtures/relay-mask-transform`,
    text => {
      const {definitions} = parseGraphQLText(extendedSchema, text);
      return new CompilerContext(extendedSchema)
        .addAll(definitions)
        .applyTransforms([
          // Requires Relay directive transform first.
          RelayDirectiveTransform.transform,
          MaskTransform.transform,
        ])
        .documents()
        .map(doc => IRPrinter.print(extendedSchema, doc))
        .join('\n');
    },
  );

  generateTestsFromFixtures(
    `${__dirname}/fixtures/relay-mask-transform-variables`,
    text => {
      const {definitions} = parseGraphQLText(extendedSchema, text);
      return new CompilerContext(extendedSchema)
        .addAll(definitions)
        .applyTransforms([
          // Requires Relay directive transform first.
          RelayDirectiveTransform.transform,
          MaskTransform.transform,
        ])
        .documents()
        .map(doc => {
          const printed = IRPrinter.print(extendedSchema, doc);
          const argumentDefinitions =
            doc.kind === 'Root' || doc.kind === 'Fragment'
              ? doc.argumentDefinitions
              : null;
          const json = JSON.stringify(argumentDefinitions, null, 2);
          return printed + json;
        })
        .join('\n\n');
    },
  );
});
