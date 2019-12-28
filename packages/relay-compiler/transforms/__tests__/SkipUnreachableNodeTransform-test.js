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
const IRPrinter = require('../../core/IRPrinter');
const RelayParser = require('../../core/RelayParser');
const SkipUnreachableNodeTransform = require('../SkipUnreachableNodeTransform');

const {
  TestSchema,
  generateTestsFromFixtures,
} = require('relay-test-utils-internal');

describe('SkipUnreachableNodeTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/skip-unreachable-node-transform`,
    text => {
      const ast = RelayParser.parse(TestSchema, text);
      return new CompilerContext(TestSchema)
        .addAll(ast)
        .applyTransforms([SkipUnreachableNodeTransform.transform])
        .documents()
        .map(doc => IRPrinter.print(TestSchema, doc))
        .join('\n');
    },
  );
});
