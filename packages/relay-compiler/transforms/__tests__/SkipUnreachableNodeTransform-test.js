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
const IRPrinter = require('../../core/IRPrinter');
const RelayParser = require('../../core/RelayParser');
const Schema = require('../../core/Schema');
const SkipUnreachableNodeTransform = require('../SkipUnreachableNodeTransform');

const {
  TestSchema,
  generateTestsFromFixtures,
} = require('relay-test-utils-internal');

describe('SkipUnreachableNodeTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/skip-unreachable-node-transform`,
    text => {
      const schema = Schema.DEPRECATED__create(TestSchema);
      const ast = RelayParser.parse(schema, text);
      return new CompilerContext(schema)
        .addAll(ast)
        .applyTransforms([SkipUnreachableNodeTransform.transform])
        .documents()
        .map(doc => IRPrinter.print(schema, doc))
        .join('\n');
    },
  );
});
