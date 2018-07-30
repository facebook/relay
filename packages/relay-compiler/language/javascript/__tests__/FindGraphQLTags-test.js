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
    return FindGraphQLTags.find(text).map(tag => tag.template);
  }

  describe('query parsing', () => {
    it('parses a simple file', () => {
      expect(find('const foo = 1;')).toEqual([]);
    });

    it('parses graphql templates', () => {
      expect(
        find(`
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
        `),
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

    it('parses modern JS syntax with Flow annotations', () => {
      expect(
        find(`
          class RelayContainer extends React.Component {
            // graphql\`this in a comment\`;
            _loadMore = (
              pageSize: number,
              options?: ?RefetchOptions
            ): ?Disposable => {
              graphql\`fragment FindGraphQLTags on User { id }\`;
            }
            render() {
              return <>A Fragment!</>;
            }
          }
        `),
      ).toEqual(['fragment FindGraphQLTags on User { id }']);
    });

    it('parses JS with functions sharing names with object prototype methods', () => {
      expect(
        find(`
          toString();
          foo(graphql\`fragment FindGraphQLTags on User { id }\`);
        `),
      ).toEqual(['fragment FindGraphQLTags on User { id }']);
    });
  });
});
