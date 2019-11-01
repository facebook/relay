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

const ClientExtensionsTransform = require('../ClientExtensionsTransform');
const CompilerContext = require('../../core/CompilerContext');
const IRPrinter = require('../../core/IRPrinter');
const Schema = require('../../core/Schema');
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
      const compilerSchema = Schema.DEPRECATED__create(
        TestSchema,
        extendedSchema,
      );
      return new CompilerContext(compilerSchema)
        .addAll(definitions)
        .applyTransforms([
          ClientExtensionsTransform.transform,
          SkipClientExtensionsTransform.transform,
        ])
        .documents()
        .map(doc => IRPrinter.print(compilerSchema, doc))
        .join('\n');
    },
  );
});
