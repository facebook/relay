/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const {TestSchema} = require('relay-test-utils-internal');

describe('CompilerContext', () => {
  let CompilerContext;
  let RelayParser;

  let queryFoo;
  let fragmentBar;
  let fragmentFoo;

  beforeEach(() => {
    jest.resetModules();
    CompilerContext = require('../CompilerContext');
    RelayParser = require('../RelayParser');
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
        new CompilerContext(TestSchema),
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
          new CompilerContext(TestSchema),
        );
      }).toThrowError(
        'CompilerContext: Duplicate document named `Foo`. GraphQL ' +
          'fragments and roots must have unique names.',
      );
    });
  });
});
