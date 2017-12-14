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

describe('FilterDirectivesTransform', () => {
  let GraphQLCompilerContext;
  let FilterDirectivesTransform;
  let GraphQLIRPrinter;
  let RelayTestSchema;
  let getGoldenMatchers;
  let parseGraphQLText;
  let transformASTSchema;

  beforeEach(() => {
    jest.resetModules();

    GraphQLCompilerContext = require('GraphQLCompilerContext');
    FilterDirectivesTransform = require('FilterDirectivesTransform');
    GraphQLIRPrinter = require('GraphQLIRPrinter');
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
      return new GraphQLCompilerContext(RelayTestSchema, extendedSchema)
        .addAll(definitions)
        .applyTransforms([FilterDirectivesTransform.transform])
        .documents()
        .map(GraphQLIRPrinter.print)
        .join('\n');
    });
  });
});
