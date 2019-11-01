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

const CompilerContext = require('../../core/CompilerContext');
const ConnectionTransform = require('../ConnectionTransform');
const IRPrinter = require('../../core/IRPrinter');
const Schema = require('../../core/Schema');

const {transformASTSchema} = require('../../core/ASTConvert');
const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

generateTestsFromFixtures(
  `${__dirname}/fixtures/connection-transform`,
  text => {
    const extendedSchema = transformASTSchema(TestSchema, [
      ConnectionTransform.SCHEMA_EXTENSION,
    ]);
    const {definitions} = parseGraphQLText(extendedSchema, text);
    const compilerSchema = Schema.DEPRECATED__create(
      TestSchema,
      extendedSchema,
    );
    return new CompilerContext(compilerSchema)
      .addAll(definitions)
      .applyTransforms([ConnectionTransform.transform])
      .documents()
      .map(
        doc =>
          IRPrinter.print(compilerSchema, doc) +
          '# Metadata:\n' +
          JSON.stringify(doc.metadata ?? null, null, 2),
      )
      .join('\n');
  },
);
