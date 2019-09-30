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

const GraphQLCompilerContext = require('../../core/GraphQLCompilerContext');
const GraphQLIRPrinter = require('../../core/GraphQLIRPrinter');
const InlineFragmentsTransform = require('../InlineFragmentsTransform');
const RelayMatchTransform = require('../RelayMatchTransform');
const RelayRelayDirectiveTransform = require('../RelayRelayDirectiveTransform');
const Schema = require('../../core/Schema');
const SkipRedundantNodesTransform = require('../SkipRedundantNodesTransform');

const {transformASTSchema} = require('../../core/ASTConvert');
const {
  TestSchema,
  parseGraphQLText,
  generateTestsFromFixtures,
} = require('relay-test-utils-internal');

describe('SkipRedundantNodesTransform', () => {
  const extendedSchema = transformASTSchema(TestSchema, [
    RelayMatchTransform.SCHEMA_EXTENSION,
  ]);
  generateTestsFromFixtures(
    `${__dirname}/fixtures/skip-redundant-nodes-transform`,
    text => {
      const {definitions} = parseGraphQLText(extendedSchema, text);
      const compilerSchema = Schema.DEPRECATED__create(
        TestSchema,
        extendedSchema,
      );
      return new GraphQLCompilerContext(compilerSchema)
        .addAll(definitions)
        .applyTransforms([
          RelayRelayDirectiveTransform.transform,
          RelayMatchTransform.transform,
          InlineFragmentsTransform.transform,
          SkipRedundantNodesTransform.transform,
        ])
        .documents()
        .map(doc => GraphQLIRPrinter.print(compilerSchema, doc))
        .join('\n');
    },
  );
});
