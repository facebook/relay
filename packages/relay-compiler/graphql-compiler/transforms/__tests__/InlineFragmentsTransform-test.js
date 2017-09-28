/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

const GraphQLCompilerContext = require('GraphQLCompilerContext');
const GraphQLIRPrinter = require('GraphQLIRPrinter');
const InlineFragmentsTransform = require('InlineFragmentsTransform');
const RelayTestSchema = require('RelayTestSchema');

const getGoldenMatchers = require('getGoldenMatchers');
const parseGraphQLText = require('parseGraphQLText');

test('InlineFragmentsTransform', () => {
  expect.extend(getGoldenMatchers(__filename));

  expect('fixtures/inline-fragments-transform').toMatchGolden(text => {
    const {schema, definitions} = parseGraphQLText(RelayTestSchema, text);
    let context = new GraphQLCompilerContext(schema).addAll(definitions);
    context = InlineFragmentsTransform.transform(context);
    return context
      .documents()
      .map(doc => GraphQLIRPrinter.print(doc))
      .join('\n');
  });
});
