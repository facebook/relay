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

const AutoAliasTransform = require('AutoAliasTransform');
const GraphQLCompilerContext = require('GraphQLCompilerContext');
const GraphQLIRPrinter = require('GraphQLIRPrinter');
const RelayParser = require('RelayParser');
const RelayTestSchema = require('RelayTestSchema');

const getGoldenMatchers = require('getGoldenMatchers');

describe('AutoAliasTransform', () => {
  beforeEach(() => {
    expect.extend(getGoldenMatchers(__filename));
  });

  it('matches expected output', () => {
    expect('fixtures/auto-alias-transform').toMatchGolden(text => {
      const ast = RelayParser.parse(RelayTestSchema, text);
      const context = ast.reduce(
        (ctx, node) => ctx.add(node),
        new GraphQLCompilerContext(RelayTestSchema),
      );
      const nextContext = AutoAliasTransform.transform(context);
      const documents = [];
      nextContext.documents().forEach(doc => {
        documents.push(GraphQLIRPrinter.print(doc));
      });
      return documents.join('\n');
    });
  });

  it('hashes argument variables and literals', () => {
    const ast = RelayParser.parse(
      RelayTestSchema,
      `
      fragment TestFragment on User {
        friends(orderby: "recent", first: $count) {
          count
        }
      }
    `,
    );
    const context = new GraphQLCompilerContext(RelayTestSchema).add(ast[0]);
    const nextContext = AutoAliasTransform.transform(context);
    const fragment = nextContext.get('TestFragment');
    const field = fragment.selections[0];
    expect(field.name).toBe('friends');
    expect(field.alias).toBe('friends_4z9fUO');
  });
});
