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

describe('FilterDirectivesTransform', () => {
  let GraphQLCompilerContext;
  let FilterDirectivesTransform;
  let RelayPrinter;
  let RelayTestSchema;
  let getGoldenMatchers;
  let parseGraphQLText;
  let transformASTSchema;

  beforeEach(() => {
    jest.resetModules();

    GraphQLCompilerContext = require('GraphQLCompilerContext');
    FilterDirectivesTransform = require('FilterDirectivesTransform');
    RelayPrinter = require('RelayPrinter');
    RelayTestSchema = require('RelayTestSchema');
    getGoldenMatchers = require('getGoldenMatchers');
    parseGraphQLText = require('parseGraphQLText');

    ({transformASTSchema} = require('ASTConvert'));

    expect.extend(getGoldenMatchers(__filename));
  });

  it('filters out directives not defined in the original schema', () => {
    expect('fixtures/filter-directives-transform').toMatchGolden(text => {
      // Extend the schema with a directive for testing purposes.
      const extendedSchema = transformASTSchema(RelayTestSchema, [
        'directive @exampleFilteredDirective on FIELD',
      ]);
      const {definitions} = parseGraphQLText(extendedSchema, text);
      let context = new GraphQLCompilerContext(extendedSchema).addAll(
        definitions,
      );

      context = FilterDirectivesTransform.transform(context, RelayTestSchema);
      const documents = [];
      context.documents().forEach(doc => {
        documents.push(RelayPrinter.print(doc));
      });
      return documents.join('\n');
    });
  });
});
