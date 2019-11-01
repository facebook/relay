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

'use strict';

const Schema = require('../Schema');

describe('CompilerContext', () => {
  let CompilerContext;
  let RelayParser;

  let queryFoo;
  let fragmentBar;
  let fragmentFoo;
  let compilerSchema;
  let TestSchema;

  beforeEach(() => {
    jest.resetModules();
    CompilerContext = require('../CompilerContext');
    RelayParser = require('../RelayParser');
    ({TestSchema} = require('relay-test-utils-internal'));
    compilerSchema = Schema.DEPRECATED__create(TestSchema);
  });

  describe('add()', () => {
    it('adds multiple roots', () => {
      [queryFoo, fragmentBar] = RelayParser.parse(
        compilerSchema,
        `
          query Foo { node(id: 1) { ...Bar } }
          fragment Bar on Node { id }
        `,
      );
      const context = [queryFoo, fragmentBar].reduce(
        (ctx, node) => ctx.add(node),
        new CompilerContext(compilerSchema),
      );

      expect(context.getRoot('Foo')).toBe(queryFoo);
      expect(context.getFragment('Bar')).toBe(fragmentBar);
    });

    it('throws if the document names are not unique', () => {
      [queryFoo, fragmentBar] = RelayParser.parse(
        compilerSchema,
        `
          query Foo { node(id: 1) { ...Bar } }
          fragment Bar on Node { id }
        `,
      );
      [fragmentFoo] = RelayParser.parse(
        compilerSchema,
        `
          fragment Foo on Node { id }
        `,
      );
      expect(() => {
        [queryFoo, fragmentBar, fragmentFoo].reduce(
          (ctx, node) => ctx.add(node),
          new CompilerContext(compilerSchema),
        );
      }).toThrowError(
        'CompilerContext: Duplicate document named `Foo`. GraphQL ' +
          'fragments and roots must have unique names.',
      );
    });
  });
});
