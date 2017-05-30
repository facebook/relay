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

const RelayCompilerContext = require('RelayCompilerContext');
const RelayExportTransform = require('RelayExportTransform');
const RelayParser = require('RelayParser');
const RelayTestSchema = require('RelayTestSchema');

const getGoldenMatchers = require('getGoldenMatchers');
const prettyStringify = require('prettyStringify');

const {transformASTSchema} = require('ASTConvert');

describe('RelayExportTransform', () => {
  beforeEach(() => {
    jasmine.addMatchers(getGoldenMatchers(__filename));
  });

  it('matches expected output', () => {
    expect('fixtures/export-transform').toMatchGolden(text => {
      const schema = transformASTSchema(RelayTestSchema, [
        RelayExportTransform.SCHEMA_EXTENSION,
      ]);
      const ast = RelayParser.parse(schema, text);
      const context = ast.reduce(
        (ctx, node) => ctx.add(node),
        new RelayCompilerContext(schema),
      );
      const nextContext = RelayExportTransform.transform(context);
      const documents = [];
      nextContext.documents().forEach(doc => {
        documents.push(prettyStringify(doc));
      });
      return documents.join('\n');
    });
  });
});
