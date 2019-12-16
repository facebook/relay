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

const ApplyFragmentArgumentTransform = require('../ApplyFragmentArgumentTransform');
const CompilerContext = require('../../core/CompilerContext');
const IRPrinter = require('../../core/IRPrinter');
const RelayParser = require('../../core/RelayParser');

const {
  TestSchema,
  generateTestsFromFixtures,
} = require('relay-test-utils-internal');

describe('ApplyFragmentArgumentTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/apply-fragment-argument-transform`,
    text => {
      const ast = RelayParser.parse(TestSchema, text);
      return new CompilerContext(TestSchema)
        .addAll(ast)
        .applyTransforms([ApplyFragmentArgumentTransform.transform])
        .documents()
        .map(doc => IRPrinter.print(TestSchema, doc))
        .join('\n');
    },
  );
});
