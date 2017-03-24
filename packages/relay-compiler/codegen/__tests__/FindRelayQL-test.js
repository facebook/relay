// Copyright 2004-present Facebook. All Rights Reserved.

'use strict';

jest.autoMockOff();

const FindRelayQL = require('FindRelayQL');

describe('FindRelayQL', () => {
  function find(text) {
    return FindRelayQL.find(text, 'FindRelayQL');
  }

  describe('query parsing', () => {
    it('parses a simple file', () => {
      expect(find('const foo = 1;')).toEqual([]);
    });

    it('parses Relay2QL templates', () => {
      expect(find(`
        // @providesModule FindRelayQL
        const foo = 1;
        foo(Relay2QL\`fragment FindRelayQL on User { id }\`);
        Relay2QL\`fragment FindRelayQL on User { name }\`;
      `)).toEqual([
        {
          tag: 'Relay2QL',
          template: 'fragment FindRelayQL on User { id }',
        },
        {
          tag: 'Relay2QL',
          template: 'fragment FindRelayQL on User { name }',
        },
      ]);
    });

    it('parses graphql templates', () => {
      expect(find(`
        // @providesModule FindRelayQL
        const foo = 1;
        foo(graphql\`fragment FindRelayQL on User { id }\`);
        graphql\`fragment FindRelayQL on User { name }\`;

        createFragmentContainer(Component, {
          foo: graphql\`fragment FindRelayQL_foo on Page { id }\`,
        });
        createPaginationContainer(
          Component,
          {},
          {
            query: graphql\`query FindRelayQLPaginationQuery { me { id } }\`,
          }
        );
        createRefetchContainer(
          Component,
          {},
          graphql\`query FindRelayQLRefetchQuery { me { id } }\`
        );

        Relay.createFragmentContainer(Component, {
          foo: graphql\`fragment FindRelayQL_foo on Page { name }\`,
        });
        Relay.createPaginationContainer(
          Component,
          {},
          {
            query: graphql\`query FindRelayQLPaginationQuery { me { name } }\`,
          }
        );
        Relay.createRefetchContainer(
          Component,
          {},
          graphql\`query FindRelayQLRefetchQuery { me { name } }\`
        );
      `)).toEqual([
        {
          tag: 'graphql',
          template: 'fragment FindRelayQL on User { id }',
        },
        {
          tag: 'graphql',
          template: 'fragment FindRelayQL on User { name }',
        },
        {
          tag: 'graphql',
          template: 'fragment FindRelayQL_foo on Page { id }',
        },
        {
          tag: 'graphql',
          template: 'query FindRelayQLPaginationQuery { me { id } }',
        },
        {
          tag: 'graphql',
          template: 'query FindRelayQLRefetchQuery { me { id } }',
        },
        {
          tag: 'graphql',
          template: 'fragment FindRelayQL_foo on Page { name }',
        },
        {
          tag: 'graphql',
          template: 'query FindRelayQLPaginationQuery { me { name } }',
        },
        {
          tag: 'graphql',
          template: 'query FindRelayQLRefetchQuery { me { name } }',
        },
      ]);
    });

    it('parses graphql.experimental templates', () => {
      expect(find(`
        // @providesModule FindRelayQL
        const foo = 1;
        foo(graphql.experimental\`fragment FindRelayQL on User { id }\`);
        graphql.experimental\`fragment FindRelayQL on User { name }\`;

        createFragmentContainer(Component, {
          foo: graphql.experimental\`fragment FindRelayQL_foo on Page { id }\`,
        });
        createPaginationContainer(
          Component,
          {},
          {
            query: graphql.experimental\`query FindRelayQLPaginationQuery { me { id } }\`,
          }
        );
        createRefetchContainer(
          Component,
          {},
          graphql.experimental\`query FindRelayQLRefetchQuery { me { id } }\`
        );

        Relay.createFragmentContainer(Component, {
          foo: graphql.experimental\`fragment FindRelayQL_foo on Page { name }\`,
        });
        Relay.createPaginationContainer(
          Component,
          {},
          {
            query: graphql.experimental\`query FindRelayQLPaginationQuery { me { name } }\`,
          }
        );
        Relay.createRefetchContainer(
          Component,
          {},
          graphql.experimental\`query FindRelayQLRefetchQuery { me { name } }\`
        );
      `)).toEqual([
        {
          tag: 'graphql.experimental',
          template: 'fragment FindRelayQL on User { id }',
        },
        {
          tag: 'graphql.experimental',
          template: 'fragment FindRelayQL on User { name }',
        },
        {
          tag: 'graphql.experimental',
          template: 'fragment FindRelayQL_foo on Page { id }',
        },
        {
          tag: 'graphql.experimental',
          template: 'query FindRelayQLPaginationQuery { me { id } }',
        },
        {
          tag: 'graphql.experimental',
          template: 'query FindRelayQLRefetchQuery { me { id } }',
        },
        {
          tag: 'graphql.experimental',
          template: 'fragment FindRelayQL_foo on Page { name }',
        },
        {
          tag: 'graphql.experimental',
          template: 'query FindRelayQLPaginationQuery { me { name } }',
        },
        {
          tag: 'graphql.experimental',
          template: 'query FindRelayQLRefetchQuery { me { name } }',
        },
      ]);
    });

    it('parses Relay2QL templates', () => {
      expect(find(`
        // @providesModule FindRelayQL
        Relay2QL\`fragment FindRelayQL on User { id }\`;
        Other\`this is not\`;
      `)).toEqual([{
        tag: 'Relay2QL',
        template: 'fragment FindRelayQL on User { id }',
      }]);
    });

    it('parses modern JS syntax with Flow annotations', () => {
      expect(find(`
        // @providesModule FindRelayQL
        class RelayContainer extends React.Component {
          // Relay2QL\`this in a comment\`;
          _loadMore = (
            pageSize: number,
            options?: ?RefetchOptions
          ): ?Disposable => {
            Relay2QL\`fragment FindRelayQL on User { id }\`;
          }
        }
      `)).toEqual([{
        tag: 'Relay2QL',
        template: 'fragment FindRelayQL on User { id }',
      }]);
    });
  });

  describe('query name validation', () => {
    it('throws for invalid query names', () => {
      expect(() => find(`
        // @providesModule FindRelayQL
        graphql\`query NotModuleName { me { id } }\`;
      `)).toThrow(
        'FindRelayQL: Operation names in graphql tags must be prefixed with ' +
        'the module name and end in "Mutation", "Query", or "Subscription". ' +
        'Got `NotModuleName` in module `FindRelayQL`.'
      );
    });

    it('parses queries with valid names', () => {
      expect(find(`
        // @providesModule FindRelayQL
        graphql\`query FindRelayQLQuery { me { id } }\`;
      `)).toEqual([{
        tag: 'graphql',
        template: 'query FindRelayQLQuery { me { id } }',
      }]);

      expect(find(`
        // @providesModule Example.react
        graphql\`query ExampleQuery { me { id } }\`;
      `)).toEqual([{
        tag: 'graphql',
        template: 'query ExampleQuery { me { id } }',
      }]);
    });

    it('throws for invalid top-level fragment names', () => {
      expect(() => find(`
        // @providesModule FindRelayQL
        graphql\`fragment NotModuleName on User { name }\`;
      `)).toThrow(
        'FindRelayQL: Fragment names in graphql tags ' +
        'must be prefixed with the module name. Got ' +
        '`NotModuleName` in module `FindRelayQL`.'
      );
    });

    it('parses top-level fragments with valid names', () => {
      expect(find(`
        // @providesModule FindRelayQL
        graphql\`fragment FindRelayQL on User { name }\`;
      `)).toEqual([{
        tag: 'graphql',
        template: 'fragment FindRelayQL on User { name }',
      }]);
    });

    it('throws for invalid container fragment names', () => {
      expect(() => find(`
        // @providesModule FindRelayQL
        createFragmentContainer(Foo, {
          foo: graphql\`fragment FindRelayQL_notFoo on User { name }\`,
        });
      `)).toThrow(
        'FindRelayQL: Container fragment names must be ' +
        '`<ModuleName>_<propName>`. Got `FindRelayQL_notFoo`, expected ' +
        '`FindRelayQL_foo`.'
      );
    });

    it('parses container fragments with valid names', () => {
      expect(find(`
        // @providesModule FindRelayQL
        createFragmentContainer(Foo, {
          foo: graphql\`fragment FindRelayQL_foo on User { name }\`,
        });
      `)).toEqual([{
        tag: 'graphql',
        template: 'fragment FindRelayQL_foo on User { name }',
      }]);
    });
  });
});
