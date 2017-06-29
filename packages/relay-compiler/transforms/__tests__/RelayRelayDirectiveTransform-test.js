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

const RelayCompilerContext = require('RelayCompilerContext');
const RelayRelayDirectiveTransform = require('RelayRelayDirectiveTransform');
const RelayParser = require('RelayParser');
const RelayTestSchema = require('RelayTestSchema');
const getGoldenMatchers = require('getGoldenMatchers');
const prettyStringify = require('prettyStringify');

const {transformASTSchema} = require('ASTConvert');

describe('RelayRelayDirectiveTransform', () => {
  beforeEach(() => {
    expect.extend(getGoldenMatchers(__filename));
  });

  it('matches expected output', () => {
    expect('fixtures/relay-directive-transform').toMatchGolden(text => {
      const schema = transformASTSchema(RelayTestSchema, [
        RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
      ]);
      const ast = RelayParser.parse(schema, text);
      const context = ast.reduce(
        (ctx, node) => ctx.add(node),
        new RelayCompilerContext(schema),
      );
      const nextContext = RelayRelayDirectiveTransform.transform(context);
      const documents = [];
      nextContext.documents().forEach(doc => {
        documents.push(prettyStringify(doc));
      });
      return documents.join('\n');
    });
  });
});
