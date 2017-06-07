/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 */

'use strict';

jest.disableAutomock();

describe('RelayFilterDirectivesTransform', () => {
  let RelayCompilerContext;
  let RelayFilterDirectivesTransform;
  let RelayPrinter;
  let RelayTestSchema;
  let getGoldenMatchers;
  let parseGraphQLText;
  let transformASTSchema;

  beforeEach(() => {
    jest.resetModules();

    RelayCompilerContext = require('RelayCompilerContext');
    RelayFilterDirectivesTransform = require('RelayFilterDirectivesTransform');
    RelayPrinter = require('RelayPrinter');
    RelayTestSchema = require('RelayTestSchema');
    getGoldenMatchers = require('getGoldenMatchers');
    parseGraphQLText = require('parseGraphQLText');

    ({transformASTSchema} = require('ASTConvert'));

    jasmine.addMatchers(getGoldenMatchers(__filename));
  });

  it('filters out directives not defined in the original schema', () => {
    expect('fixtures/filter-directives-transform').toMatchGolden(text => {
      // Extend the schema with a directive for testing purposes.
      const extendedSchema = transformASTSchema(RelayTestSchema, [
        'directive @exampleFilteredDirective on FIELD',
      ]);
      const {definitions} = parseGraphQLText(extendedSchema, text);
      let context = new RelayCompilerContext(extendedSchema).addAll(
        definitions,
      );

      context = RelayFilterDirectivesTransform.transform(
        context,
        RelayTestSchema,
      );
      const documents = [];
      context.documents().forEach(doc => {
        documents.push(RelayPrinter.print(doc));
      });
      return documents.join('\n');
    });
  });
});
