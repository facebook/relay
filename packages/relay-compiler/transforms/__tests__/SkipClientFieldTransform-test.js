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

describe('SkipClientFieldTransform', () => {
  let GraphQLCompilerContext;
  let GraphQLIRPrinter;
  let SkipClientFieldTransform;
  let RelayTestSchema;
  let getGoldenMatchers;
  let parseGraphQLText;

  beforeEach(() => {
    jest.resetModules();

    GraphQLCompilerContext = require('GraphQLCompilerContext');
    GraphQLIRPrinter = require('GraphQLIRPrinter');
    SkipClientFieldTransform = require('SkipClientFieldTransform');
    RelayTestSchema = require('RelayTestSchema');
    getGoldenMatchers = require('getGoldenMatchers');
    parseGraphQLText = require('parseGraphQLText');

    expect.extend(getGoldenMatchers(__filename));
  });

  it('skips fields/types not defined in the original schema', () => {
    expect('fixtures/skip-client-field-transform').toMatchGolden(text => {
      const {definitions, schema} = parseGraphQLText(RelayTestSchema, text);
      let context = new GraphQLCompilerContext(schema).addAll(definitions);
      context = SkipClientFieldTransform.transform(context, RelayTestSchema);
      const documents = [];
      context.forEachDocument(doc => {
        documents.push(GraphQLIRPrinter.print(doc));
      });
      return documents.join('\n');
    });
  });
});
