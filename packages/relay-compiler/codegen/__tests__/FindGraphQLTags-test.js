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

const FindGraphQLTags = require('FindGraphQLTags');

describe('FindGraphQLTags', () => {
  function find(text) {
    return FindGraphQLTags.find(text, '/path/to/FindGraphQLTags.js', {
      validateNames: true,
    });
  }

  describe('query parsing', () => {
    it('parses a simple file', () => {
      expect(find('const foo = 1;')).toEqual([]);
    });

    it('parses Relay2QL templates', () => {
      expect(
        find(
          `
            const foo = 1;
            foo(Relay2QL\`fragment FindGraphQLTags on User { id }\`);
            Relay2QL\`fragment FindGraphQLTags on User { name }\`;
          `,
        ),
      ).toEqual([
        'fragment FindGraphQLTags on User { id }',
        'fragment FindGraphQLTags on User { name }',
      ]);
    });

    it('parses graphql templates', () => {
      expect(
        find(
          `
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
        'fragment FindGraphQLTags on User { id }',
        'fragment FindGraphQLTags on User { name }',
        'fragment FindGraphQLTags_foo on Page { id }',
        'query FindGraphQLTagsPaginationQuery { me { id } }',
        'query FindGraphQLTagsRefetchQuery { me { id } }',
        'fragment FindGraphQLTags_foo on Page { name }',
        'query FindGraphQLTagsPaginationQuery { me { name } }',
        'query FindGraphQLTagsRefetchQuery { me { name } }',
      ]);
    });

    it('parses Relay2QL templates', () => {
      expect(
        find(
          `
            Relay2QL\`fragment FindGraphQLTags on User { id }\`;
            Other\`this is not\`;
          `,
        ),
      ).toEqual(['fragment FindGraphQLTags on User { id }']);
    });

    it('parses modern JS syntax with Flow annotations', () => {
      expect(
        find(
          `
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
      ).toEqual(['fragment FindGraphQLTags on User { id }']);
    });
  });

  describe('query validation', () => {
    it('prints correct file numbers in errors', () => {
      expect(() => {
        find(
          'const foo = 1;\n' +
            'foo(graphql`\n' +
            '  fragment FindGraphQLTags on User {\n' +
            '    ?\n' +
            '    id\n' +
            '  }\n' +
            '`);\n',
        );
      }).toThrow(
        'Syntax Error /path/to/FindGraphQLTags.js (4:5) ' +
          'Cannot parse the unexpected character "?".\n\n' +
          '3:   fragment FindGraphQLTags on User {\n' +
          '4:     ?\n' +
          '       ^\n' +
          '5:     id\n',
      );
    });
  });

  describe('query name validation', () => {
    it('throws for invalid query names', () => {
      expect(() =>
        FindGraphQLTags.find(
          'graphql`query NotModuleName { me { id } }`;',
          '/path/to/FindGraphQLTags.js',
          {validateNames: true},
        ),
      ).toThrow(
        'FindGraphQLTags: Operation names in graphql tags must be prefixed with ' +
          'the module name and end in "Mutation", "Query", or "Subscription". ' +
          'Got `NotModuleName` in module `FindGraphQLTags`.',
      );
    });

    it('does not validate names when options is not set', () => {
      FindGraphQLTags.find(
        'graphql`query NotModuleName { me { id } }`;',
        '/path/to/FindGraphQLTags.js',
        {validateNames: false},
      );
    });

    it('parses queries with valid names', () => {
      expect(
        find('graphql`query FindGraphQLTagsQuery { me { id } }`;'),
      ).toEqual(['query FindGraphQLTagsQuery { me { id } }']);
    });

    it('parses queries with valid names from filepath', () => {
      expect(
        FindGraphQLTags.find(
          'graphql`query TestComponentQuery { me { id } }`;',
          './PathTo/SuperDuper/TestComponent.js',
          {validateNames: true},
        ),
      ).toEqual(['query TestComponentQuery { me { id } }']);
      expect(
        FindGraphQLTags.find(
          'graphql`query TestComponentQuery { me { id } }`;',
          './PathTo/SuperDuper/TestComponent.react.js',
          {validateNames: true},
        ),
      ).toEqual(['query TestComponentQuery { me { id } }']);
      expect(
        FindGraphQLTags.find(
          'graphql`query TestComponentQuery { me { id } }`;',
          './PathTo/SuperDuper/TestComponent.react.jsx',
          {validateNames: true},
        ),
      ).toEqual(['query TestComponentQuery { me { id } }']);
      expect(
        FindGraphQLTags.find(
          'graphql`query TestComponentQuery { me { id } }`;',
          './PathTo/SuperDuper/TestComponent/index.js',
          {validateNames: true},
        ),
      ).toEqual(['query TestComponentQuery { me { id } }']);
    });

    it('throws for invalid top-level fragment names', () => {
      expect(() =>
        find('graphql`fragment NotModuleName on User { name }`;'),
      ).toThrow(
        'FindGraphQLTags: Fragment names in graphql tags ' +
          'must be prefixed with the module name. Got ' +
          '`NotModuleName` in module `FindGraphQLTags`.',
      );
    });

    it('parses top-level fragments with valid names', () => {
      expect(
        find('graphql`fragment FindGraphQLTags on User { name }`;'),
      ).toEqual(['fragment FindGraphQLTags on User { name }']);
    });

    it('throws for invalid container fragment names', () => {
      expect(() =>
        find(`
          createFragmentContainer(Foo, {
            foo: graphql\`fragment FindGraphQLTags_notFoo on User { name }\`,
          });
        `),
      ).toThrow(
        'FindGraphQLTags: Container fragment names must be ' +
          '`<ModuleName>_<propName>`. Got `FindGraphQLTags_notFoo`, expected ' +
          '`FindGraphQLTags_foo`.',
      );
    });

    it('parses container fragments with valid names', () => {
      expect(
        find(`
          createFragmentContainer(Foo, {
            foo: graphql\`fragment FindGraphQLTags_foo on User { name }\`,
          });
        `),
      ).toEqual(['fragment FindGraphQLTags_foo on User { name }']);
    });
  });
});
