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

const RelayCompilerContext = require('RelayCompilerContext');
const RelayGenerateRequisiteFieldsTransform =
  require('RelayGenerateRequisiteFieldsTransform');
const RelayParser = require('RelayParser');
const RelayPrinter = require('RelayPrinter');
const RelayTestSchema = require('RelayTestSchema');
const getGoldenMatchers = require('getGoldenMatchers');

describe('RelayGenerateRequisiteFieldsTransform', () => {
  beforeEach(() => {
    jasmine.addMatchers(getGoldenMatchers(__filename));
  });

  it('matches expected output', () => {
    expect('fixtures/generate-requisite-fields-transform').toMatchGolden(text => {
      const ast = RelayParser.parse(RelayTestSchema, text);
      const context = ast.reduce(
        (ctx, node) => ctx.add(node),
        new RelayCompilerContext(RelayTestSchema)
      );
      const nextContext = RelayGenerateRequisiteFieldsTransform.transform(context);
      const documents = [];
      nextContext.documents().map(doc => {
        documents.push(RelayPrinter.print(doc));
      });
      return documents.join('\n');
    });
  });
});
