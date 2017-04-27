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

describe('RelayStripUnusedVariablesTransform', () => {
  let RelayCompilerContext;
  let RelayPrinter;
  let RelayStripUnusedVariablesTransform;
  let RelayTestSchema;
  let getGoldenMatchers;
  let parseGraphQLText;

  beforeEach(() => {
    jest.resetModules();

    RelayCompilerContext = require('RelayCompilerContext');
    RelayPrinter = require('RelayPrinter');
    RelayStripUnusedVariablesTransform = require('RelayStripUnusedVariablesTransform');
    RelayTestSchema = require('RelayTestSchema');
    getGoldenMatchers = require('getGoldenMatchers');
    parseGraphQLText = require('parseGraphQLText');

    jasmine.addMatchers(getGoldenMatchers(__filename));
  });

  it('matches expected output', () => {
    expect('fixtures/strip-unused-variables-transform').toMatchGolden(text => {
      const {definitions} = parseGraphQLText(RelayTestSchema, text);
      let context = (new RelayCompilerContext(RelayTestSchema)).addAll(definitions);
      context = RelayStripUnusedVariablesTransform.transform(context);
      const documents = [];
      context.documents().forEach(doc => {
        documents.push(RelayPrinter.print(doc));
      });
      return documents.join('\n');
    });
  });
});
