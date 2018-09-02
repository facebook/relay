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
const GraphQLIRPrinter = require('GraphQLIRPrinter');
const RelayParser = require('RelayParser');
const RelayRelayDirectiveTransform = require('RelayRelayDirectiveTransform');
const RelayTestSchema = require('RelayTestSchema');

const {generateTestsFromFixtures} = require('RelayModernTestUtils');

import type {FlattenOptions} from 'FlattenTransform';

describe('FlattenTransform', () => {
  function printContextTransform(
    options: FlattenOptions,
  ): (text: string) => string {
    return text => {
      const {transformASTSchema} = require('ASTConvert');
      const extendedSchema = transformASTSchema(RelayTestSchema, [
        RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
      ]);
      return new GraphQLCompilerContext(RelayTestSchema, extendedSchema)
        .addAll(RelayParser.parse(extendedSchema, text))
        .applyTransforms([FlattenTransform.transformWithOptions(options)])
        .documents()
        .map(doc => GraphQLIRPrinter.print(doc))
        .join('\n');
    };
  }

  generateTestsFromFixtures(
    `${__dirname}/fixtures/flatten-transform`,
    printContextTransform({}),
  );

  generateTestsFromFixtures(
    `${__dirname}/fixtures/flatten-transform-option-flatten-inline`,
    printContextTransform({flattenInlineFragments: true}),
  );

  generateTestsFromFixtures(
    `${__dirname}/fixtures/flatten-transform-errors`,
    printContextTransform({flattenInlineFragments: true}),
  );
});
