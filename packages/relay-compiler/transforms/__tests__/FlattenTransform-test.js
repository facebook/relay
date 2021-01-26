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
const IRPrinter = require('../../core/IRPrinter');
const MatchTransform = require('../../transforms/MatchTransform');
const RelayDirectiveTransform = require('../RelayDirectiveTransform');
const RelayParser = require('../../core/RelayParser');

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
      const extendedSchema = TestSchema.extend([
        MatchTransform.SCHEMA_EXTENSION,
        RelayDirectiveTransform.SCHEMA_EXTENSION,
      ]);
      return new CompilerContext(extendedSchema)
        .addAll(RelayParser.parse(extendedSchema, text))
        .applyTransforms([
          MatchTransform.transform,
          FlattenTransform.transformWithOptions(options),
        ])
        .documents()
        .map(doc => IRPrinter.print(extendedSchema, doc))
        .join('\n');
    };
  }

  generateTestsFromFixtures(
    `${__dirname}/fixtures/flatten-transform`,
    printContextTransform({isForCodegen: false}),
  );

  generateTestsFromFixtures(
    `${__dirname}/fixtures/flatten-transform-errors`,
    printContextTransform({isForCodegen: false}),
  );

  generateTestsFromFixtures(
    `${__dirname}/fixtures/flatten-transform-option-flatten-abstract`,
    printContextTransform({isForCodegen: true}),
  );
});
