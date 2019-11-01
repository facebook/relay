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
const FlattenTransform = require('../FlattenTransform');
const IRPrinter = require('../../core/IRPrinter');
const MatchTransform = require('../../transforms/MatchTransform');
const RelayDirectiveTransform = require('../RelayDirectiveTransform');
const RelayParser = require('../../core/RelayParser');
const Schema = require('../../core/Schema');

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
        MatchTransform.SCHEMA_EXTENSION,
        RelayDirectiveTransform.SCHEMA_EXTENSION,
      ]);
      const compilerSchema = Schema.DEPRECATED__create(
        TestSchema,
        extendedSchema,
      );
      return new CompilerContext(compilerSchema)
        .addAll(RelayParser.parse(compilerSchema, text))
        .applyTransforms([
          MatchTransform.transform,
          FlattenTransform.transformWithOptions(options),
        ])
        .documents()
        .map(doc => IRPrinter.print(compilerSchema, doc))
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
