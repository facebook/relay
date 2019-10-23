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

const ConnectionTransform = require('../ConnectionTransform');
const GraphQLCompilerContext = require('../../core/GraphQLCompilerContext');
const GraphQLIRPrinter = require('../../core/GraphQLIRPrinter');
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
    return new GraphQLCompilerContext(compilerSchema)
      .addAll(definitions)
      .applyTransforms([ConnectionTransform.transform])
      .documents()
      .map(
        doc =>
          GraphQLIRPrinter.print(compilerSchema, doc) +
          '# Metadata:\n' +
          JSON.stringify(doc.metadata ?? null, null, 2),
      )
      .join('\n');
  },
);
