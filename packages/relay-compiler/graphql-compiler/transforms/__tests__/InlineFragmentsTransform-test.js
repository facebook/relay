/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
