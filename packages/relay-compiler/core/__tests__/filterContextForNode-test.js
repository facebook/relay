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

const CompilerContext = require('../CompilerContext');
const IRPrinter = require('../IRPrinter');

const filterContextForNode = require('../filterContextForNode');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

const MAIN_QUERY_NAME = 'MainQuery';

describe('filterContextForNode', () => {
  generateTestsFromFixtures(`${__dirname}/fixtures/filter-context`, text => {
    const {definitions} = parseGraphQLText(TestSchema, text);

    const context = new CompilerContext(TestSchema).addAll(definitions);
    const printerContext = filterContextForNode(
      /* $FlowFixMe[incompatible-call] - null or undefined is incompatible with
       * union type */
      context.get(MAIN_QUERY_NAME),
      context,
    );
    return printerContext
      .documents()
      .map(doc => IRPrinter.print(TestSchema, doc))
      .join('\n');
  });
});
