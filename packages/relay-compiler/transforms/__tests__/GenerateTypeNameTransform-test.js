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
const FlattenTransform = require('../FlattenTransform');
const GenerateTypeNameTransform = require('../GenerateTypeNameTransform');
const InlineFragmentsTransform = require('../InlineFragmentsTransform');
const RelayParser = require('../../core/RelayParser');

const {
  TestSchema,
  generateTestsFromFixtures,
  printAST,
} = require('relay-test-utils-internal');

describe('GenerateTypeNameTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/generate-typename-transform`,
    text => {
      const ast = RelayParser.parse(TestSchema, text);
      return new CompilerContext(TestSchema)
        .addAll(ast)
        .applyTransforms([
          InlineFragmentsTransform.transform,
          FlattenTransform.transformWithOptions({isForCodegen: true}),
          GenerateTypeNameTransform.transform,
        ])
        .documents()
        .map(doc => printAST(doc))
        .join('\n');
    },
  );
});
