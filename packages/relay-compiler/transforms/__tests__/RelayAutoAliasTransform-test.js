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

const RelayAutoAliasTransform = require('RelayAutoAliasTransform');
const RelayCompilerContext = require('RelayCompilerContext');
const RelayParser = require('RelayParser');
const RelayPrinter = require('RelayPrinter');
const RelayTestSchema = require('RelayTestSchema');
const getGoldenMatchers = require('getGoldenMatchers');

describe('RelayAutoAliasTransform', () => {
  beforeEach(() => {
    jasmine.addMatchers(getGoldenMatchers(__filename));
  });

  it('matches expected output', () => {
    expect('fixtures/auto-alias-transform').toMatchGolden(text => {
      const ast = RelayParser.parse(RelayTestSchema, text);
      const context = ast.reduce(
        (ctx, node) => ctx.add(node),
        new RelayCompilerContext(RelayTestSchema)
      );
      const nextContext = RelayAutoAliasTransform.transform(context);
      const documents = [];
      nextContext.documents().forEach(doc => {
        documents.push(RelayPrinter.print(doc));
      });
      return documents.join('\n');
    });
  });

  it('hashes argument variables and literals', () => {
    const ast = RelayParser.parse(RelayTestSchema, `
      fragment TestFragment on User {
        friends(orderby: "recent", first: $count) {
          count
        }
      }
    `);
    const context = new RelayCompilerContext(RelayTestSchema).add(ast[0]);
    const nextContext = RelayAutoAliasTransform.transform(context);
    const fragment = nextContext.get('TestFragment');
    const field = fragment.selections[0];
    expect(field.name).toBe('friends');
    expect(field.alias).toBe('friends_4z9fUO');
  });
});
