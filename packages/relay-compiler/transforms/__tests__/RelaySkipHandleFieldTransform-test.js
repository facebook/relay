/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

describe('RelaySkipHandleFieldTransform', () => {
  let GraphQLCompilerContext;
  let GraphQLIRPrinter;
  let RelaySkipHandleFieldTransform;
  let RelayTestSchema;
  let getGoldenMatchers;
  let parseGraphQLText;

  beforeEach(() => {
    jest.resetModules();

    GraphQLCompilerContext = require('GraphQLCompilerContext');
    GraphQLIRPrinter = require('GraphQLIRPrinter');
    RelaySkipHandleFieldTransform = require('RelaySkipHandleFieldTransform');
    RelayTestSchema = require('RelayTestSchema');
    getGoldenMatchers = require('getGoldenMatchers');
    parseGraphQLText = require('parseGraphQLText');

    expect.extend(getGoldenMatchers(__filename));
  });

  it('removes field handles', () => {
    expect('fixtures/skip-handle-field-transform').toMatchGolden(text => {
      const {definitions} = parseGraphQLText(RelayTestSchema, text);
      let context = new GraphQLCompilerContext(RelayTestSchema).addAll(
        definitions,
      );
      context = RelaySkipHandleFieldTransform.transform(
        context,
        RelayTestSchema,
      );
      const documents = [];
      context.forEachDocument(doc => {
        documents.push(GraphQLIRPrinter.print(doc));
      });
      return documents.join('\n');
    });
  });
});
