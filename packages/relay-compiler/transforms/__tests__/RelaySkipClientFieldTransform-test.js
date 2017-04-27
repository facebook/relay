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

describe('RelaySkipClientFieldTransform', () => {
  let RelayCompilerContext;
  let RelayPrinter;
  let RelaySkipClientFieldTransform;
  let RelayTestSchema;
  let getGoldenMatchers;
  let parseGraphQLText;

  beforeEach(() => {
    jest.resetModules();

    RelayCompilerContext = require('RelayCompilerContext');
    RelayPrinter = require('RelayPrinter');
    RelaySkipClientFieldTransform = require('RelaySkipClientFieldTransform');
    RelayTestSchema = require('RelayTestSchema');
    getGoldenMatchers = require('getGoldenMatchers');
    parseGraphQLText = require('parseGraphQLText');

    jasmine.addMatchers(getGoldenMatchers(__filename));
  });

  it('skips fields/types not defined in the original schema', () => {
    expect('fixtures/skip-client-field-transform').toMatchGolden(text => {
      const {definitions, schema} = parseGraphQLText(RelayTestSchema, text);
      let context = (new RelayCompilerContext(schema)).addAll(definitions);
      context = RelaySkipClientFieldTransform.transform(context, RelayTestSchema);
      const documents = [];
      context.documents().forEach(doc => {
        documents.push(RelayPrinter.print(doc));
      });
      return documents.join('\n');
    });
  });
});
