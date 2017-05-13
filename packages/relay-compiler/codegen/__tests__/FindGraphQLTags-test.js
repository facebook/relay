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

jest.autoMockOff();

const FindGraphQLTags = require('FindGraphQLTags');

describe('FindGraphQLTags', () => {
  function find(text) {
    return FindGraphQLTags.find(text, 'FindGraphQLTags');
  }

  describe('query parsing', () => {
    it('parses a simple file', () => {
      expect(find('const foo = 1;')).toEqual([]);
    });

    it('parses Relay2QL templates', () => {
      expect(
        find(
          `
        // @providesModule FindGraphQLTags
        const foo = 1;
        foo(Relay2QL\`fragment FindGraphQLTags on User { id }\`);
        Relay2QL\`fragment FindGraphQLTags on User { name }\`;
      `,
        ),
      ).toEqual([
        {
          tag: 'Relay2QL',
          template: 'fragment FindGraphQLTags on User { id }',
        },
        {
          tag: 'Relay2QL',
          template: 'fragment FindGraphQLTags on User { name }',
        },
      ]);
    });

    it('parses graphql templates', () => {
      expect(
        find(
          `
        // @providesModule FindGraphQLTags
        const foo = 1;
        foo(graphql\`fragment FindGraphQLTags on User { id }\`);
        graphql\`fragment FindGraphQLTags on User { name }\`;

        createFragmentContainer(Component, {
          foo: graphql\`fragment FindGraphQLTags_foo on Page { id }\`,
        });
        createPaginationContainer(
          Component,
          {},
          {
            query: graphql\`query FindGraphQLTagsPaginationQuery { me { id } }\`,
          }
        );
        createRefetchContainer(
          Component,
          {},
          graphql\`query FindGraphQLTagsRefetchQuery { me { id } }\`
        );

        Relay.createFragmentContainer(Component, {
          foo: graphql\`fragment FindGraphQLTags_foo on Page { name }\`,
        });
        Relay.createPaginationContainer(
          Component,
          {},
          {
            query: graphql\`query FindGraphQLTagsPaginationQuery { me { name } }\`,
          }
        );
        Relay.createRefetchContainer(
          Component,
          {},
          graphql\`query FindGraphQLTagsRefetchQuery { me { name } }\`
        );
      `,
        ),
      ).toEqual([
        {
          tag: 'graphql',
          template: 'fragment FindGraphQLTags on User { id }',
        },
        {
          tag: 'graphql',
          template: 'fragment FindGraphQLTags on User { name }',
        },
        {
          tag: 'graphql',
          template: 'fragment FindGraphQLTags_foo on Page { id }',
        },
        {
          tag: 'graphql',
          template: 'query FindGraphQLTagsPaginationQuery { me { id } }',
        },
        {
          tag: 'graphql',
          template: 'query FindGraphQLTagsRefetchQuery { me { id } }',
        },
        {
          tag: 'graphql',
          template: 'fragment FindGraphQLTags_foo on Page { name }',
        },
        {
          tag: 'graphql',
          template: 'query FindGraphQLTagsPaginationQuery { me { name } }',
        },
        {
          tag: 'graphql',
          template: 'query FindGraphQLTagsRefetchQuery { me { name } }',
        },
      ]);
    });

    it('parses graphql.experimental templates', () => {
      expect(
        find(
          `
        // @providesModule FindGraphQLTags
        const foo = 1;
        foo(graphql.experimental\`fragment FindGraphQLTags on User { id }\`);
        graphql.experimental\`fragment FindGraphQLTags on User { name }\`;

        createFragmentContainer(Component, {
          foo: graphql.experimental\`fragment FindGraphQLTags_foo on Page { id }\`,
        });
        createPaginationContainer(
          Component,
          {},
          {
            query: graphql.experimental\`query FindGraphQLTagsPaginationQuery { me { id } }\`,
          }
        );
        createRefetchContainer(
          Component,
          {},
          graphql.experimental\`query FindGraphQLTagsRefetchQuery { me { id } }\`
        );

        Relay.createFragmentContainer(Component, {
          foo: graphql.experimental\`fragment FindGraphQLTags_foo on Page { name }\`,
        });
        Relay.createPaginationContainer(
          Component,
          {},
          {
            query: graphql.experimental\`query FindGraphQLTagsPaginationQuery { me { name } }\`,
          }
        );
        Relay.createRefetchContainer(
          Component,
          {},
          graphql.experimental\`query FindGraphQLTagsRefetchQuery { me { name } }\`
        );
      `,
        ),
      ).toEqual([
        {
          tag: 'graphql.experimental',
          template: 'fragment FindGraphQLTags on User { id }',
        },
        {
          tag: 'graphql.experimental',
          template: 'fragment FindGraphQLTags on User { name }',
        },
        {
          tag: 'graphql.experimental',
          template: 'fragment FindGraphQLTags_foo on Page { id }',
        },
        {
          tag: 'graphql.experimental',
          template: 'query FindGraphQLTagsPaginationQuery { me { id } }',
        },
        {
          tag: 'graphql.experimental',
          template: 'query FindGraphQLTagsRefetchQuery { me { id } }',
        },
        {
          tag: 'graphql.experimental',
          template: 'fragment FindGraphQLTags_foo on Page { name }',
        },
        {
          tag: 'graphql.experimental',
          template: 'query FindGraphQLTagsPaginationQuery { me { name } }',
        },
        {
          tag: 'graphql.experimental',
          template: 'query FindGraphQLTagsRefetchQuery { me { name } }',
        },
      ]);
    });

    it('parses Relay2QL templates', () => {
      expect(
        find(
          `
        // @providesModule FindGraphQLTags
        Relay2QL\`fragment FindGraphQLTags on User { id }\`;
        Other\`this is not\`;
      `,
        ),
      ).toEqual([
        {
          tag: 'Relay2QL',
          template: 'fragment FindGraphQLTags on User { id }',
        },
      ]);
    });

    it('parses modern JS syntax with Flow annotations', () => {
      expect(
        find(
          `
        // @providesModule FindGraphQLTags
        class RelayContainer extends React.Component {
          // Relay2QL\`this in a comment\`;
          _loadMore = (
            pageSize: number,
            options?: ?RefetchOptions
          ): ?Disposable => {
            Relay2QL\`fragment FindGraphQLTags on User { id }\`;
          }
        }
      `,
        ),
      ).toEqual([
        {
          tag: 'Relay2QL',
          template: 'fragment FindGraphQLTags on User { id }',
        },
      ]);
    });
  });

  describe('query name validation', () => {
    it('throws for invalid query names', () => {
      expect(() =>
        find(
          `
        // @providesModule FindGraphQLTags
        graphql\`query NotModuleName { me { id } }\`;
      `,
        ),
      ).toThrow(
        'FindGraphQLTags: Operation names in graphql tags must be prefixed with ' +
          'the module name and end in "Mutation", "Query", or "Subscription". ' +
          'Got `NotModuleName` in module `FindGraphQLTags`.',
      );
    });

    it('parses queries with valid names', () => {
      expect(
        find(
          `
        // @providesModule FindGraphQLTags
        graphql\`query FindGraphQLTagsQuery { me { id } }\`;
      `,
        ),
      ).toEqual([
        {
          tag: 'graphql',
          template: 'query FindGraphQLTagsQuery { me { id } }',
        },
      ]);

      expect(
        find(
          `
        // @providesModule Example.react
        graphql\`query ExampleQuery { me { id } }\`;
      `,
        ),
      ).toEqual([
        {
          tag: 'graphql',
          template: 'query ExampleQuery { me { id } }',
        },
      ]);
    });

    it('parses queries with valid names from filepath', () => {
      expect(
        FindGraphQLTags.find(
          'graphql\`query TestComponentQuery { me { id } }\`;',
          './PathTo/SuperDuper/TestComponent.js',
        ),
      ).toEqual([
        {
          tag: 'graphql',
          template: 'query TestComponentQuery { me { id } }',
        },
      ]);
      expect(
        FindGraphQLTags.find(
          'graphql\`query TestComponentQuery { me { id } }\`;',
          './PathTo/SuperDuper/TestComponent.react.js',
        ),
      ).toEqual([
        {
          tag: 'graphql',
          template: 'query TestComponentQuery { me { id } }',
        },
      ]);
      expect(
        FindGraphQLTags.find(
          'graphql\`query TestComponentQuery { me { id } }\`;',
          './PathTo/SuperDuper/TestComponent.react.jsx',
        ),
      ).toEqual([
        {
          tag: 'graphql',
          template: 'query TestComponentQuery { me { id } }',
        },
      ]);
      expect(
        FindGraphQLTags.find(
          'graphql\`query TestComponentQuery { me { id } }\`;',
          './PathTo/SuperDuper/TestComponent/index.js',
        ),
      ).toEqual([
        {
          tag: 'graphql',
          template: 'query TestComponentQuery { me { id } }',
        },
      ]);
    });

    it('throws for invalid top-level fragment names', () => {
      expect(() =>
        find(
          `
        // @providesModule FindGraphQLTags
        graphql\`fragment NotModuleName on User { name }\`;
      `,
        ),
      ).toThrow(
        'FindGraphQLTags: Fragment names in graphql tags ' +
          'must be prefixed with the module name. Got ' +
          '`NotModuleName` in module `FindGraphQLTags`.',
      );
    });

    it('parses top-level fragments with valid names', () => {
      expect(
        find(
          `
        // @providesModule FindGraphQLTags
        graphql\`fragment FindGraphQLTags on User { name }\`;
      `,
        ),
      ).toEqual([
        {
          tag: 'graphql',
          template: 'fragment FindGraphQLTags on User { name }',
        },
      ]);
    });

    it('throws for invalid container fragment names', () => {
      expect(() =>
        find(
          `
        // @providesModule FindGraphQLTags
        createFragmentContainer(Foo, {
          foo: graphql\`fragment FindGraphQLTags_notFoo on User { name }\`,
        });
      `,
        ),
      ).toThrow(
        'FindGraphQLTags: Container fragment names must be ' +
          '`<ModuleName>_<propName>`. Got `FindGraphQLTags_notFoo`, expected ' +
          '`FindGraphQLTags_foo`.',
      );
    });

    it('parses container fragments with valid names', () => {
      expect(
        find(
          `
        // @providesModule FindGraphQLTags
        createFragmentContainer(Foo, {
          foo: graphql\`fragment FindGraphQLTags_foo on User { name }\`,
        });
      `,
        ),
      ).toEqual([
        {
          tag: 'graphql',
          template: 'fragment FindGraphQLTags_foo on User { name }',
        },
      ]);
    });
  });
});
