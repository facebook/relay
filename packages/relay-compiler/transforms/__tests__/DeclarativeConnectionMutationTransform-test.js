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
const DeclarativeConnectionMutationTransform = require('../DeclarativeConnectionMutationTransform');
const IRPrinter = require('../../core/IRPrinter');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

generateTestsFromFixtures(
  `${__dirname}/fixtures/declarative-connection-mutation-transform`,
  text => {
    const extendedSchema = TestSchema.extend([
      DeclarativeConnectionMutationTransform.SCHEMA_EXTENSION,
    ]);
    const {definitions} = parseGraphQLText(extendedSchema, text);
    return new CompilerContext(extendedSchema)
      .addAll(definitions)
      .applyTransforms([DeclarativeConnectionMutationTransform.transform])
      .documents()
      .map(doc => IRPrinter.print(extendedSchema, doc))
      .join('\n');
  },
);
