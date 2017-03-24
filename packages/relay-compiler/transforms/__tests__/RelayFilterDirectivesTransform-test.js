/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

jest.disableAutomock();

describe('RelayFilterDirectivesTransform', () => {
  let RelayCompilerContext;
  let RelayPrinter;
  let RelayExportTransform;
  let RelayFilterDirectivesTransform;
  let RelayTestSchema;
  let getGoldenMatchers;
  let parseGraphQLText;

  beforeEach(() => {
    jest.resetModules();

    RelayCompilerContext = require('RelayCompilerContext');
    RelayPrinter = require('RelayPrinter');
    RelayExportTransform = require('RelayExportTransform');
    RelayFilterDirectivesTransform = require('RelayFilterDirectivesTransform');
    RelayTestSchema = require('RelayTestSchema');
    getGoldenMatchers = require('getGoldenMatchers');
    parseGraphQLText = require('parseGraphQLText');

    jasmine.addMatchers(getGoldenMatchers(__filename));
  });

  it('filters out directives not defined in the original schema', () => {
    expect('fixtures/filter-directives-transform').toMatchGolden(text => {
      // Extend the schema with an `@export` directive for testing purposes.
      const extendedSchema = RelayExportTransform.transformSchema(
        RelayTestSchema
      );
      const {definitions} = parseGraphQLText(extendedSchema, text);
      let context = (new RelayCompilerContext(extendedSchema)).addAll(definitions);

      context = RelayFilterDirectivesTransform.transform(
        context,
        RelayTestSchema
      );
      const documents = [];
      context.documents().forEach(doc => {
        documents.push(RelayPrinter.print(doc));
      });
      return documents.join('\n');
    });
  });
});
