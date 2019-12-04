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

const ClientExtensionsTransform = require('../ClientExtensionsTransform');
const CompilerContext = require('../../core/CompilerContext');
const IRPrinter = require('../../core/IRPrinter');
const SkipClientExtensionsTransform = require('../SkipClientExtensionsTransform');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('SkipClientExtensionsTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/skip-client-extensions-transform`,
    text => {
      const {definitions, schema: extendedSchema} = parseGraphQLText(
        TestSchema,
        text,
      );
      return new CompilerContext(extendedSchema)
        .addAll(definitions)
        .applyTransforms([
          ClientExtensionsTransform.transform,
          SkipClientExtensionsTransform.transform,
        ])
        .documents()
        .map(doc => IRPrinter.print(extendedSchema, doc))
        .join('\n');
    },
  );
});
