/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

describe('StripUnusedVariablesTransform', () => {
  let GraphQLCompilerContext;
  let GraphQLIRPrinter;
  let StripUnusedVariablesTransform;
  let RelayTestSchema;
  let getGoldenMatchers;
  let parseGraphQLText;

  beforeEach(() => {
    jest.resetModules();

    GraphQLCompilerContext = require('GraphQLCompilerContext');
    GraphQLIRPrinter = require('GraphQLIRPrinter');
    StripUnusedVariablesTransform = require('StripUnusedVariablesTransform');
    RelayTestSchema = require('RelayTestSchema');
    getGoldenMatchers = require('getGoldenMatchers');
    parseGraphQLText = require('parseGraphQLText');

    expect.extend(getGoldenMatchers(__filename));
  });

  it('matches expected output', () => {
    expect('fixtures/strip-unused-variables-transform').toMatchGolden(text => {
      const {definitions} = parseGraphQLText(RelayTestSchema, text);
      let context = new GraphQLCompilerContext(RelayTestSchema).addAll(
        definitions,
      );
      context = StripUnusedVariablesTransform.transform(context);
      const documents = [];
      context.documents().forEach(doc => {
        documents.push(GraphQLIRPrinter.print(doc));
      });
      return documents.join('\n');
    });
  });
});
