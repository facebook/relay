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

describe('RelaySkipHandleFieldTransform', () => {
  let RelayCompilerContext;
  let RelayPrinter;
  let RelaySkipHandleFieldTransform;
  let RelayTestSchema;
  let getGoldenMatchers;
  let parseGraphQLText;

  beforeEach(() => {
    jest.resetModules();

    RelayCompilerContext = require('RelayCompilerContext');
    RelayPrinter = require('RelayPrinter');
    RelaySkipHandleFieldTransform = require('RelaySkipHandleFieldTransform');
    RelayTestSchema = require('RelayTestSchema');
    getGoldenMatchers = require('getGoldenMatchers');
    parseGraphQLText = require('parseGraphQLText');

    expect.extend(getGoldenMatchers(__filename));
  });

  it('removes field handles', () => {
    expect('fixtures/skip-handle-field-transform').toMatchGolden(text => {
      const {definitions} = parseGraphQLText(RelayTestSchema, text);
      let context = new RelayCompilerContext(RelayTestSchema).addAll(
        definitions,
      );
      context = RelaySkipHandleFieldTransform.transform(
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
