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

'use strict';

const GraphQLCompilerContext = require('../../core/GraphQLCompilerContext');
const GraphQLIRPrinter = require('../../core/GraphQLIRPrinter');
const MaskTransform = require('../MaskTransform');
const RelayDirectiveTransform = require('../RelayDirectiveTransform');
const Schema = require('../../core/Schema');

const {transformASTSchema} = require('../../core/ASTConvert');
const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('MaskTransform', () => {
  const extendedSchema = transformASTSchema(TestSchema, [
    RelayDirectiveTransform.SCHEMA_EXTENSION,
  ]);

  generateTestsFromFixtures(
    `${__dirname}/fixtures/relay-mask-transform`,
    text => {
      const {definitions} = parseGraphQLText(extendedSchema, text);
      const compilerSchema = Schema.DEPRECATED__create(
        TestSchema,
        extendedSchema,
      );
      return new GraphQLCompilerContext(compilerSchema)
        .addAll(definitions)
        .applyTransforms([
          // Requires Relay directive transform first.
          RelayDirectiveTransform.transform,
          MaskTransform.transform,
        ])
        .documents()
        .map(doc => GraphQLIRPrinter.print(compilerSchema, doc))
        .join('\n');
    },
  );

  generateTestsFromFixtures(
    `${__dirname}/fixtures/relay-mask-transform-variables`,
    text => {
      const {definitions} = parseGraphQLText(extendedSchema, text);
      const compilerSchema = Schema.DEPRECATED__create(
        TestSchema,
        extendedSchema,
      );
      return new GraphQLCompilerContext(compilerSchema)
        .addAll(definitions)
        .applyTransforms([
          // Requires Relay directive transform first.
          RelayDirectiveTransform.transform,
          MaskTransform.transform,
        ])
        .documents()
        .map(doc => {
          const printed = GraphQLIRPrinter.print(compilerSchema, doc);
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
