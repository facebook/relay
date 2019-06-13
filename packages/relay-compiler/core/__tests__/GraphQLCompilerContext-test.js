/**
 * Copyright (c) Facebook, Inc. and its affiliates.
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
  let TestSchema;
  let matchers;

  let queryFoo;
  let fragmentBar;
  let fragmentFoo;

  beforeEach(() => {
    jest.resetModules();
    GraphQLCompilerContext = require('../GraphQLCompilerContext');
    RelayParser = require('../RelayParser');
    ({TestSchema, matchers} = require('relay-test-utils-internal'));

    expect.extend(matchers);
  });

  describe('add()', () => {
    it('adds multiple roots', () => {
      [queryFoo, fragmentBar] = RelayParser.parse(
        TestSchema,
        `
          query Foo { node(id: 1) { ...Bar } }
          fragment Bar on Node { id }
        `,
      );
      const context = [queryFoo, fragmentBar].reduce(
        (ctx, node) => ctx.add(node),
        new GraphQLCompilerContext(TestSchema),
      );

      expect(context.getRoot('Foo')).toBe(queryFoo);
      expect(context.getFragment('Bar')).toBe(fragmentBar);
    });

    it('throws if the document names are not unique', () => {
      [queryFoo, fragmentBar] = RelayParser.parse(
        TestSchema,
        `
          query Foo { node(id: 1) { ...Bar } }
          fragment Bar on Node { id }
        `,
      );
      [fragmentFoo] = RelayParser.parse(
        TestSchema,
        `
          fragment Foo on Node { id }
        `,
      );
      expect(() => {
        [queryFoo, fragmentBar, fragmentFoo].reduce(
          (ctx, node) => ctx.add(node),
          new GraphQLCompilerContext(TestSchema),
        );
      }).toFailInvariant(
        'GraphQLCompilerContext: Duplicate document named `Foo`. GraphQL ' +
          'fragments and roots must have unique names.',
      );
    });
  });
});
