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
const RelayDirectiveTransform = require('../RelayDirectiveTransform');
const RelayParser = require('../../core/RelayParser');

const {
  TestSchema,
  generateTestsFromFixtures,
  printAST,
} = require('relay-test-utils-internal');

describe('RelayDirectiveTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/relay-directive-transform`,
    text => {
      const schema = TestSchema.extend([
        RelayDirectiveTransform.SCHEMA_EXTENSION,
      ]);
      const ast = RelayParser.parse(schema, text);
      return new CompilerContext(schema)
        .addAll(ast)
        .applyTransforms([RelayDirectiveTransform.transform])
        .documents()
        .map(doc => printAST(doc))
        .join('\n');
    },
  );
});
