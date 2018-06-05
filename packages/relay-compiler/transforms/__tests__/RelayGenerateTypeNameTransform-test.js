/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const FlattenTransform = require('FlattenTransform');
const GraphQLCompilerContext = require('GraphQLCompilerContext');
const InlineFragmentsTransform = require('InlineFragmentsTransform');
const RelayGenerateTypeNameTransform = require('RelayGenerateTypeNameTransform');
const RelayParser = require('RelayParser');
const RelayTestSchema = require('RelayTestSchema');

const {generateTestsFromFixtures} = require('RelayModernTestUtils');

describe('RelayGenerateTypeNameTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/generate-typename-transform`,
    text => {
      const ast = RelayParser.parse(RelayTestSchema, text);
      return new GraphQLCompilerContext(RelayTestSchema)
        .addAll(ast)
        .applyTransforms([
          InlineFragmentsTransform.transform,
          FlattenTransform.transformWithOptions({flattenAbstractTypes: true}),
          RelayGenerateTypeNameTransform.transform,
        ])
        .documents()
        .map(doc => JSON.stringify(doc, null, 2))
        .join('\n');
    },
  );
});
