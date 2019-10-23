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
const GraphQLCompilerContext = require('../../core/GraphQLCompilerContext');
const GraphQLIRPrinter = require('../../core/GraphQLIRPrinter');
const Schema = require('../../core/Schema');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('ClientExtensionsTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/client-extensions-transform`,
    text => {
      const {definitions, schema: extendedSchema} = parseGraphQLText(
        TestSchema,
        text,
      );
      const compilerSchema = Schema.DEPRECATED__create(
        TestSchema,
        extendedSchema,
      );
      return new GraphQLCompilerContext(compilerSchema)
        .addAll(definitions)
        .applyTransforms([ClientExtensionsTransform.transform])
        .documents()
        .map(doc => GraphQLIRPrinter.print(compilerSchema, doc))
        .join('\n');
    },
  );
});
