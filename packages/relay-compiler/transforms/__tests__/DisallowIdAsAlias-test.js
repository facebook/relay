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
const DisallowIdAsAlias = require('../DisallowIdAsAlias');
const IRPrinter = require('../../core/IRPrinter');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

generateTestsFromFixtures(`${__dirname}/fixtures/DisallowIdAsAlias`, text => {
  const {definitions} = parseGraphQLText(TestSchema, text);
  return new CompilerContext(TestSchema)
    .addAll(definitions)
    .applyTransforms([DisallowIdAsAlias.transform])
    .documents()
    .map(doc => IRPrinter.print(TestSchema, doc))
    .join('\n');
});
//
