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
const RelayMaskTransform = require('RelayMaskTransform');
const RelayRelayDirectiveTransform = require('RelayRelayDirectiveTransform');
const RelayTestSchema = require('RelayTestSchema');

const getGoldenMatchers = require('getGoldenMatchers');
const parseGraphQLText = require('parseGraphQLText');

const {transformASTSchema} = require('ASTConvert');

test('RelayMaskTransform', () => {
  expect.extend(getGoldenMatchers(__filename));
  const schema = transformASTSchema(RelayTestSchema, [
    RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
  ]);

  expect('fixtures/relay-mask-transform').toMatchGolden(text => {
    const {definitions} = parseGraphQLText(schema, text);
    let context = new GraphQLCompilerContext(schema).addAll(definitions);
    context = RelayMaskTransform.transform(context);
    return context
      .documents()
      .map(doc => GraphQLIRPrinter.print(doc))
      .join('\n');
  });
});
