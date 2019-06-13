/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const FlattenTransform = require('../FlattenTransform');
const GraphQLCompilerContext = require('../../core/GraphQLCompilerContext');
const GraphQLIRPrinter = require('../../core/GraphQLIRPrinter');
const RelayMatchTransform = require('../../transforms/RelayMatchTransform');
const RelayParser = require('../../core/RelayParser');
const RelayRelayDirectiveTransform = require('../RelayRelayDirectiveTransform');

const {
  TestSchema,
  generateTestsFromFixtures,
} = require('relay-test-utils-internal');

import type {FlattenOptions} from '../FlattenTransform';

describe('FlattenTransform', () => {
  function printContextTransform(
    options: FlattenOptions,
  ): (text: string) => string {
    return text => {
      const {transformASTSchema} = require('../../core/ASTConvert');
      const extendedSchema = transformASTSchema(TestSchema, [
        RelayMatchTransform.SCHEMA_EXTENSION,
        RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
      ]);
      return new GraphQLCompilerContext(TestSchema, extendedSchema)
        .addAll(RelayParser.parse(extendedSchema, text))
        .applyTransforms([
          RelayMatchTransform.transform,
          FlattenTransform.transformWithOptions(options),
        ])
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
    `${__dirname}/fixtures/flatten-transform-errors`,
    printContextTransform({}),
  );
});
