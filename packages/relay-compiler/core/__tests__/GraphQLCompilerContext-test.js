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

describe('GraphQLCompilerContext', () => {
  let GraphQLCompilerContext;
  let RelayParser;
  let RelayTestSchema;
  let RelayModernTestUtils;

  let queryFoo;
  let fragmentBar;
  let fragmentFoo;
  let parseGraphQLText;

  beforeEach(() => {
    jest.resetModules();
    GraphQLCompilerContext = require('GraphQLCompilerContext');
    RelayParser = require('RelayParser');
    parseGraphQLText = require('parseGraphQLText');
    RelayTestSchema = require('RelayTestSchema');
    RelayModernTestUtils = require('RelayModernTestUtils');

    expect.extend(RelayModernTestUtils.matchers);

    [queryFoo, fragmentFoo, fragmentBar] = RelayParser.parse(
      RelayTestSchema,
      `
      query Foo { node(id: 1) { ...Bar } }
      fragment Foo on Node { id }
      fragment Bar on Node { id }
    `,
    );
  });

  describe('add()', () => {
    it('adds multiple roots', () => {
      const context = [queryFoo, fragmentBar].reduce(
        (ctx, node) => ctx.add(node),
        new GraphQLCompilerContext(RelayTestSchema),
      );

      expect(context.getRoot('Foo')).toBe(queryFoo);
      expect(context.getFragment('Bar')).toBe(fragmentBar);
    });

    it('throws if the root names are not unique', () => {
      expect(() => {
        [queryFoo, fragmentFoo].reduce(
          (ctx, node) => ctx.add(node),
          new GraphQLCompilerContext(RelayTestSchema),
        );
      }).toFailInvariant(
        'GraphQLCompilerContext: Duplicate document named `Foo`. GraphQL ' +
          'fragments and roots must have unique names.',
      );
    });
  });
  describe('updateSchema()', () => {
    it('returns new context for schema extending query', () => {
      const prevContext = new GraphQLCompilerContext(RelayTestSchema);
      const {definitions, schema} = parseGraphQLText(
        RelayTestSchema,
        `
        extend type User {
          best_friends: FriendsConnection
        }
        fragment Bar on User {
          best_friends {
            edges {
              node {id}
            }
          }
        }
      `,
      );
      const context = prevContext.updateSchema(schema);

      expect(context).not.toEqual(prevContext);
      expect(context.schema).not.toEqual(RelayTestSchema);
      expect(() => context.add(definitions)).not.toThrow();
    });
  });
});
