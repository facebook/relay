/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const {getFragment, getRequest, graphql} = require('../../query/GraphQLTag');
const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const {createNormalizationSelector} = require('../RelayModernSelector');
const RelayRecordSource = require('../RelayRecordSource');
const {mark} = require('../RelayReferenceMarker');
const {ROOT_ID} = require('../RelayStoreUtils');

describe('RelayReferenceMarker', () => {
  let source;

  beforeEach(() => {
    const data = {
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        firstName: 'Alice',
        'friends(first:3)': {__ref: 'client:1'},
        'profilePicture(size:32)': {__ref: 'client:4'},
      },
      '2': {
        __id: '2',
        __typename: 'User',
        id: '2',
        firstName: 'Bob',
      },
      '3': {
        __id: '3',
        __typename: 'User',
        id: '3',
        firstName: 'Claire',
      },
      'client:1': {
        __id: 'client:1',
        __typename: 'FriendsConnection',
        edges: {
          __refs: ['client:2', null, 'client:3'],
        },
      },
      'client:2': {
        __id: 'client:2',
        __typename: 'FriendsConnectionEdge',
        cursor: 'cursor:2',
        node: {__ref: '2'},
      },
      'client:3': {
        __id: 'client:3',
        __typename: 'FriendsConnectionEdge',
        cursor: 'cursor:3',
        node: {__ref: '3'},
      },
      'client:4': {
        __id: 'client:4',
        __typename: 'Photo',
        uri: 'https://...',
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"1")': {__ref: '1'},
      },
    };

    source = RelayRecordSource.create(data);
  });

  it('marks referenced records', () => {
    const FooQuery = getRequest(graphql`
      query RelayReferenceMarkerTest1Query($id: ID, $size: [Int]) {
        node(id: $id) {
          id
          __typename
          ... on Page {
            actors {
              name
            }
          }
          ...RelayReferenceMarkerTest1Fragment @arguments(size: $size)
        }
      }
    `);
    graphql`
      fragment RelayReferenceMarkerTest1Fragment on User
      @argumentDefinitions(size: {type: "[Int]"}) {
        ... on User {
          firstName
          friends(first: 3) {
            edges {
              cursor
              node {
                id
                firstName
              }
            }
          }
          profilePicture(size: $size) {
            uri
          }
        }
      }
    `;
    const references = new Set();
    mark(
      source,
      createNormalizationSelector(FooQuery.operation, ROOT_ID, {
        id: '1',
        size: 32,
      }),
      references,
    );
    expect(Array.from(references).sort()).toEqual([
      '1',
      '2',
      '3',
      'client:1',
      'client:2',
      'client:3',
      'client:4',
      'client:root',
    ]);
  });

  it('marks "handle" nodes for queries', () => {
    const data = {
      '1': {
        __id: '1',
        __typename: 'User',
        'friends(first:1)': {__ref: 'client:1'},
        __friends_bestFriends: {__ref: 'client:bestFriends'},
      },
      '2': {
        __id: '2',
        __typename: 'User',
        id: '2',
      },
      '3': {
        __id: '3',
        __typename: 'User',
        id: '3',
      },
      'client:1': {
        __id: 'client:1',
        __typename: 'FriendsConnection',
        edges: {
          __refs: ['client:2'],
        },
      },
      'client:2': {
        __id: 'client:2',
        __typename: 'FriendsConnectionEdge',
        cursor: 'cursor:2',
        node: {__ref: '2'},
      },
      'client:bestFriends': {
        __id: 'client:bestFriends',
        __typename: 'FriendsConnection',
        edges: {
          __refs: ['client:bestFriendsEdge'],
        },
      },
      'client:bestFriendsEdge': {
        __id: 'client:bestFriendsEdge',
        __typename: 'FriendsConnectionEdge',
        cursor: 'cursor:bestFriendsEdge',
        node: {__ref: '3'},
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"1")': {__ref: '1'},
      },
    };
    source = RelayRecordSource.create(data);
    const UserProfile = getRequest(graphql`
      query RelayReferenceMarkerTest2Query($id: ID!) {
        node(id: $id) {
          ... on User {
            friends(first: 1) @__clientField(handle: "bestFriends") {
              edges {
                cursor
                node {
                  id
                  name @__clientField(handle: "friendsName")
                }
              }
            }
          }
        }
      }
    `);
    const references = new Set();
    mark(
      source,
      createNormalizationSelector(UserProfile.operation, ROOT_ID, {
        id: '1',
      }),
      references,
    );
    expect(Array.from(references).sort()).toEqual([
      '1',
      '2',
      '3', // bestFriends.edges[0].node
      'client:1',
      'client:2',
      'client:bestFriends', // bestFriends
      'client:bestFriendsEdge', // bestFriends.edges[0]
      'client:root',
    ]);
  });

  it('marks "handle" nodes with key and filters for queries', () => {
    const data = {
      '1': {
        __id: '1',
        __typename: 'User',
        'friends(first:1,orderby:["first name"])': {__ref: 'client:1'},
        '__UserProfile_friends_bestFriends(orderby:["first name"])': {
          __ref: 'client:bestFriends',
        },
        '__UserProfile_friends_bestFriends(orderby:["last name"])': {
          __ref: 'client:bestFriendsByLastName',
        },
      },
      '2': {
        __id: '2',
        __typename: 'User',
        id: '2',
      },
      '3': {
        __id: '3',
        __typename: 'User',
        id: '3',
      },
      'client:1': {
        __id: 'client:1',
        __typename: 'FriendsConnection',
        edges: {
          __refs: ['client:2'],
        },
      },
      'client:2': {
        __id: 'client:2',
        __typename: 'FriendsConnectionEdge',
        cursor: 'cursor:2',
        node: {__ref: '2'},
      },
      'client:bestFriends': {
        __id: 'client:bestFriends',
        __typename: 'FriendsConnection',
        edges: {
          __refs: ['client:bestFriendsEdge'],
        },
      },
      'client:bestFriendsByLastName': {
        __id: 'client:bestFriendsByLastName',
        __typename: 'FriendsConnection',
        edges: {
          __refs: [],
        },
      },
      'client:bestFriendsEdge': {
        __id: 'client:bestFriendsEdge',
        __typename: 'FriendsConnectionEdge',
        cursor: 'cursor:bestFriendsEdge',
        node: {__ref: '3'},
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"1")': {__ref: '1'},
      },
    };
    source = RelayRecordSource.create(data);
    const UserProfile = getRequest(graphql`
      query RelayReferenceMarkerTest3Query($id: ID!, $orderby: [String]) {
        node(id: $id) {
          ... on User {
            friends(first: 1, orderby: $orderby)
              @__clientField(
                handle: "bestFriends"
                key: "UserProfile_friends"
                filters: ["orderby"]
              ) {
              edges {
                cursor
                node {
                  id
                  name @__clientField(handle: "friendsName")
                }
              }
            }
          }
        }
      }
    `);
    let references = new Set();
    mark(
      source,
      createNormalizationSelector(UserProfile.operation, ROOT_ID, {
        id: '1',
        orderby: ['first name'],
      }),
      references,
    );
    expect(Array.from(references).sort()).toEqual([
      '1',
      '2',
      '3', // bestFriends.edges[0].node
      'client:1',
      'client:2',
      'client:bestFriends', // bestFriends
      'client:bestFriendsEdge', // bestFriends.edges[0]
      'client:root',
    ]);

    references = new Set();
    mark(
      source,
      createNormalizationSelector(UserProfile.operation, ROOT_ID, {
        id: '1',
        orderby: ['last name'],
      }),
      references,
    );
    expect(Array.from(references).sort()).toEqual([
      '1',
      'client:bestFriendsByLastName',
      'client:root',
    ]);
  });

  it('marks referenced records for client field', () => {
    const data = {
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        firstName: 'Alice',
        best_friends: {__ref: 'client:1'},
        client_foo: {__ref: 'client:foo'},
      },
      '2': {
        __id: '2',
        __typename: 'User',
        id: '2',
        firstName: 'Bob',
      },
      '3': {
        __id: '3',
        __typename: 'User',
        id: '3',
        firstName: 'Claire',
      },
      'client:1': {
        __id: 'client:1',
        __typename: 'FriendsConnection',
        edges: {
          __refs: ['client:2', null, 'client:3'],
        },
      },
      'client:2': {
        __id: 'client:2',
        __typename: 'FriendsConnectionEdge',
        cursor: 'cursor:2',
        node: {__ref: '2'},
      },
      'client:3': {
        __id: 'client:3',
        __typename: 'FriendsConnectionEdge',
        cursor: 'cursor:3',
        node: {__ref: '3'},
      },
      'client:foo': {
        __id: 'client:foo',
        __typename: 'Foo',
        client_name: 'client',
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"1")': {__ref: '1'},
      },
    };
    source = RelayRecordSource.create(data);
    const FooQuery = getRequest(graphql`
      query RelayReferenceMarkerTest4Query($id: ID) {
        node(id: $id) {
          id
          __typename
          ...RelayReferenceMarkerTest2Fragment
        }
      }
    `);
    graphql`
      fragment RelayReferenceMarkerTest2Fragment on User {
        client_foo {
          client_name
          profile_picture(scale: 2) {
            uri
          }
        }
        ... on User {
          nickname
          best_friends {
            client_friends_connection_field
            edges {
              client_friend_edge_field
              cursor
              node {
                id
                firstName
              }
            }
          }
          firstName
        }
      }
    `;
    const references = new Set();
    mark(
      source,
      createNormalizationSelector(FooQuery.operation, ROOT_ID, {
        id: '1',
        size: 32,
      }),
      references,
    );
    expect(Array.from(references).sort()).toEqual([
      '1',
      '2',
      '3',
      'client:1',
      'client:2',
      'client:3',
      'client:foo',
      'client:root',
    ]);
  });

  describe('when using a @match field', () => {
    let BarQuery;
    let loader;

    beforeEach(() => {
      const nodes = {};
      nodes.RelayReferenceMarkerTestPlainUserNameRenderer_name =
        getFragment(graphql`
          fragment RelayReferenceMarkerTestPlainUserNameRenderer_name on PlainUserNameRenderer {
            plaintext
            data {
              text
            }
          }
        `);
      nodes.RelayReferenceMarkerTestMarkdownUserNameRenderer_name =
        getFragment(graphql`
          fragment RelayReferenceMarkerTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
            markdown
            data {
              markup
            }
          }
        `);
      graphql`
        fragment RelayReferenceMarkerTest3Fragment on User {
          id
          nameRenderer @match {
            ...RelayReferenceMarkerTestPlainUserNameRenderer_name
              @module(name: "PlainUserNameRenderer.react")
            ...RelayReferenceMarkerTestMarkdownUserNameRenderer_name
              @module(name: "MarkdownUserNameRenderer.react")
          }
        }
      `;
      BarQuery = getRequest(graphql`
        query RelayReferenceMarkerTest5Query($id: ID!) {
          node(id: $id) {
            ...RelayReferenceMarkerTest3Fragment
          }
        }
      `);
      loader = {
        get: jest.fn(
          moduleName => nodes[String(moduleName).replace(/\$.*/, '')],
        ),
        load: jest.fn(moduleName =>
          Promise.resolve(nodes[String(moduleName).replace(/\$.*/, '')]),
        ),
      };
    });

    it('marks references when the match field/record exist and match a supported type (plaintext)', () => {
      // When the type matches PlainUserNameRenderer
      const storeData = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          'nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])':
            {
              __ref:
                'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
            },
        },
        'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])':
          {
            __id: 'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
            __typename: 'PlainUserNameRenderer',
            __module_component_RelayReferenceMarkerTest3Fragment:
              'PlainUserNameRenderer.react',
            __module_operation_RelayReferenceMarkerTest3Fragment:
              'RelayReferenceMarkerTestPlainUserNameRenderer_name$normalization.graphql',
            plaintext: 'plain name',
            data: {__ref: 'data'},
          },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
        data: {
          __id: 'data',
          __typename: 'PlainUserNameData',
          text: 'text',
        },
      };
      source = RelayRecordSource.create(storeData);
      const references = new Set();
      mark(
        source,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        references,
        loader,
      );
      expect(Array.from(references).sort()).toEqual([
        '1',
        'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
        'client:root',
        'data',
      ]);
    });

    it('marks references when the match field/record exist and match a supported type (2)', () => {
      // When the type matches MarkdownUserNameRenderer
      const storeData = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          'nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])':
            {
              __ref:
                'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
            },
        },
        'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])':
          {
            __id: 'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
            __typename: 'MarkdownUserNameRenderer',
            __module_component_RelayReferenceMarkerTest3Fragment:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayReferenceMarkerTest3Fragment:
              'RelayReferenceMarkerTestMarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {__ref: 'data'},
          },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
        data: {
          __id: 'data',
          __typename: 'MarkdownUserNameData',
          markup: '<markup/>',
        },
      };
      source = RelayRecordSource.create(storeData);
      const references = new Set();
      mark(
        source,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        references,
        loader,
      );
      expect(Array.from(references).sort()).toEqual([
        '1',
        'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
        'client:root',
        'data',
      ]);
    });

    it('marks references when the match field/record exist but the matched fragment has not been processed', () => {
      // The field returned the MarkdownUserNameRenderer type, but the module for that branch
      // has not been loaded. The assumption is that the data cannot have been processed in that
      // case and therefore the markdown field is missing in the store.
      const storeData = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          'nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])':
            {
              __ref:
                'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
            },
        },
        'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])':
          {
            __id: 'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
            __typename: 'MarkdownUserNameRenderer',
            // NOTE: markdown/data fields are missing, data not processed.
          },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      source = RelayRecordSource.create(storeData);
      const references = new Set();
      mark(
        source,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        references,
        // Return null to indicate the fragment is not loaded yet
        {
          get: _ => null,
          load: _ => Promise.resolve(null),
        },
      );
      expect(Array.from(references).sort()).toEqual([
        '1',
        'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
        'client:root',
      ]);
    });

    it('marks references when the match field/record exist but a scalar field is missing', () => {
      // the `data` field for the MarkdownUserNameRenderer is missing
      const storeData = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          'nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])':
            {
              __ref:
                'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
            },
        },
        'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])':
          {
            __id: 'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
            __typename: 'MarkdownUserNameRenderer',
            __module_component_RelayReferenceMarkerTest3Fragment:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayReferenceMarkerTest3Fragment:
              'RelayReferenceMarkerTestMarkdownUserNameRenderer_name$normalization.graphql',
            // NOTE: 'markdown' field missing
            data: {__ref: 'data'},
          },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
        data: {
          __id: 'data',
          __typename: 'MarkdownUserNameData',
          markup: '<markup/>',
        },
      };
      source = RelayRecordSource.create(storeData);
      const references = new Set();
      mark(
        source,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        references,
        loader,
      );
      expect(Array.from(references).sort()).toEqual([
        '1',
        'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
        'client:root',
        'data',
      ]);
    });

    it('marks references when the match field/record exist but a linked field is missing', () => {
      // the `data` field for the MarkdownUserNameRenderer is missing
      const storeData = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          'nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])':
            {
              __ref:
                'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
            },
        },
        'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])':
          {
            __id: 'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
            __typename: 'MarkdownUserNameRenderer',
            markdown: 'markdown text',
            // NOTE: 'data' field missing
          },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      source = RelayRecordSource.create(storeData);
      const references = new Set();
      mark(
        source,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        references,
        loader,
      );
      expect(Array.from(references).sort()).toEqual([
        '1',
        'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
        'client:root',
      ]);
    });

    it('marks references when the match field/record exist but do not match a supported type', () => {
      const storeData = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          'nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])':
            {
              __ref:
                'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
            },
        },
        'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])':
          {
            __id: 'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
            __typename: 'CustomNameRenderer',
            customField: 'custom value',
          },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      source = RelayRecordSource.create(storeData);
      const references = new Set();
      mark(
        source,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        references,
        loader,
      );
      expect(Array.from(references).sort()).toEqual([
        '1',
        'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
        'client:root',
      ]);
    });

    it('marks references when the match field is non-existent (null)', () => {
      const storeData = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          'nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])':
            null,
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      source = RelayRecordSource.create(storeData);
      const references = new Set();
      mark(
        source,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        references,
        loader,
      );
      expect(Array.from(references).sort()).toEqual(['1', 'client:root']);
    });

    it('marks references when the match field is not fetched (undefined)', () => {
      const storeData = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      source = RelayRecordSource.create(storeData);
      const references = new Set();
      mark(
        source,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        references,
        loader,
      );
      expect(Array.from(references).sort()).toEqual(['1', 'client:root']);
    });
  });

  describe('@module', () => {
    let BarQuery;
    let loader;

    beforeEach(() => {
      const nodes = {};
      nodes.RelayReferenceMarkerTest2PlainUserNameRenderer_name =
        getFragment(graphql`
          fragment RelayReferenceMarkerTest2PlainUserNameRenderer_name on PlainUserNameRenderer {
            plaintext
            data {
              text
            }
          }
        `);
      nodes.RelayReferenceMarkerTest2MarkdownUserNameRenderer_name =
        getFragment(graphql`
          fragment RelayReferenceMarkerTest2MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
            markdown
            data {
              markup
            }
          }
        `);
      graphql`
        fragment RelayReferenceMarkerTest4Fragment on User {
          id
          nameRenderer {
            # intentionally no @match
            ...RelayReferenceMarkerTest2PlainUserNameRenderer_name
              @module(name: "PlainUserNameRenderer.react")
            ...RelayReferenceMarkerTest2MarkdownUserNameRenderer_name
              @module(name: "MarkdownUserNameRenderer.react")
          }
        }
      `;
      BarQuery = getRequest(graphql`
        query RelayReferenceMarkerTest6Query($id: ID!) {
          node(id: $id) {
            ...RelayReferenceMarkerTest4Fragment
          }
        }
      `);
      loader = {
        get: jest.fn(
          moduleName => nodes[String(moduleName).replace(/\$.*/, '')],
        ),
        load: jest.fn(moduleName =>
          Promise.resolve(nodes[String(moduleName).replace(/\$.*/, '')]),
        ),
      };
    });

    it('marks references when the field/record exists and matches a @module selection (plaintext)', () => {
      // When the type matches PlainUserNameRenderer
      const storeData = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __ref: 'client:1:nameRenderer',
          },
        },
        'client:1:nameRenderer': {
          __id: 'client:1:nameRenderer',
          __typename: 'PlainUserNameRenderer',
          __module_component_RelayReferenceMarkerTest4Fragment:
            'PlainUserNameRenderer.react',
          __module_operation_RelayReferenceMarkerTest4Fragment:
            'RelayReferenceMarkerTest2PlainUserNameRenderer_name$normalization.graphql',
          plaintext: 'plain name',
          data: {__ref: 'data'},
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
        data: {
          __id: 'data',
          __typename: 'PlainUserNameData',
          text: 'text',
        },
      };
      source = RelayRecordSource.create(storeData);
      const references = new Set();
      mark(
        source,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        references,
        loader,
      );
      expect(Array.from(references).sort()).toEqual([
        '1',
        'client:1:nameRenderer',
        'client:root',
        'data',
      ]);
    });

    it('marks references when the field/record exists and matches a @module selection (markdown)', () => {
      // When the type matches MarkdownUserNameRenderer
      const storeData = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __ref: 'client:1:nameRenderer',
          },
        },
        'client:1:nameRenderer': {
          __id: 'client:1:nameRenderer',
          __typename: 'MarkdownUserNameRenderer',
          __module_component_RelayReferenceMarkerTest4Fragment:
            'MarkdownUserNameRenderer.react',
          __module_operation_RelayReferenceMarkerTest4Fragment:
            'RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$normalization.graphql',
          markdown: 'markdown payload',
          data: {__ref: 'data'},
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
        data: {
          __id: 'data',
          __typename: 'MarkdownUserNameData',
          markup: '<markup/>',
        },
      };
      source = RelayRecordSource.create(storeData);
      const references = new Set();
      mark(
        source,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        references,
        loader,
      );
      expect(Array.from(references).sort()).toEqual([
        '1',
        'client:1:nameRenderer',
        'client:root',
        'data',
      ]);
    });

    it('marks references when the field/record exists but the @module fragment has not been processed', () => {
      // The field returned the MarkdownUserNameRenderer type, but the module for that branch
      // has not been loaded. The assumption is that the data cannot have been processed in that
      // case and therefore the markdown field is missing in the store.
      const storeData = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __ref: 'client:1:nameRenderer',
          },
        },
        'client:1:nameRenderer': {
          __id: 'client:1:nameRenderer',
          __typename: 'MarkdownUserNameRenderer',
          // NOTE: markdown/data fields are missing, data not processed.
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      source = RelayRecordSource.create(storeData);
      const references = new Set();
      mark(
        source,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        references,
        // Return null to indicate the fragment is not loaded yet
        {
          get: _ => null,
          load: _ => Promise.resolve(null),
        },
      );
      expect(Array.from(references).sort()).toEqual([
        '1',
        'client:1:nameRenderer',
        'client:root',
      ]);
    });

    it('marks references when the field/record exists but a scalar field is missing', () => {
      // the `data` field for the MarkdownUserNameRenderer is missing
      const storeData = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __ref: 'client:1:nameRenderer',
          },
        },
        'client:1:nameRenderer': {
          __id: 'client:1:nameRenderer',
          __typename: 'MarkdownUserNameRenderer',
          __module_component_RelayReferenceMarkerTest4Fragment:
            'MarkdownUserNameRenderer.react',
          __module_operation_RelayReferenceMarkerTest4Fragment:
            'RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$normalization.graphql',
          // NOTE: 'markdown' field missing
          data: {__ref: 'data'},
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
        data: {
          __id: 'data',
          __typename: 'MarkdownUserNameData',
          markup: '<markup/>',
        },
      };
      source = RelayRecordSource.create(storeData);
      const references = new Set();
      mark(
        source,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        references,
        loader,
      );
      expect(Array.from(references).sort()).toEqual([
        '1',
        'client:1:nameRenderer',
        'client:root',
        'data',
      ]);
    });

    it('marks references when the field/record exists but a linked field is missing', () => {
      // the `data` field for the MarkdownUserNameRenderer is missing
      const storeData = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __ref: 'client:1:nameRenderer',
          },
        },
        'client:1:nameRenderer': {
          __id: 'client:1:nameRenderer',
          __typename: 'MarkdownUserNameRenderer',
          markdown: 'markdown text',
          // NOTE: 'data' field missing
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      source = RelayRecordSource.create(storeData);
      const references = new Set();
      mark(
        source,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        references,
        loader,
      );
      expect(Array.from(references).sort()).toEqual([
        '1',
        'client:1:nameRenderer',
        'client:root',
      ]);
    });

    it('marks references when the field/record exists but do not match any @module selection', () => {
      const storeData = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __ref: 'client:1:nameRenderer',
          },
        },
        'client:1:nameRenderer': {
          __id: 'client:1:nameRenderer',
          __typename: 'CustomNameRenderer',
          customField: 'custom value',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      source = RelayRecordSource.create(storeData);
      const references = new Set();
      mark(
        source,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        references,
        loader,
      );
      expect(Array.from(references).sort()).toEqual([
        '1',
        'client:1:nameRenderer',
        'client:root',
      ]);
    });

    it('throws if no operation loader is provided', () => {
      const storeData = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __ref: 'client:1:nameRenderer',
          },
        },
        'client:1:nameRenderer': {
          __id: 'client:1:nameRenderer',
          __typename: 'PlainUserNameRenderer',
          __module_component_RelayReferenceMarkerTest4Fragment:
            'PlainUserNameRenderer.react',
          __module_operation_RelayReferenceMarkerTest4Fragment:
            'RelayReferenceMarkerTest2PlainUserNameRenderer_name$normalization.graphql',
          plaintext: 'plain name',
          data: {__ref: 'data'},
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
        data: {
          __id: 'data',
          __typename: 'PlainUserNameData',
          text: 'text',
        },
      };
      source = RelayRecordSource.create(storeData);
      const references = new Set();
      expect(() =>
        mark(
          source,
          createNormalizationSelector(BarQuery.operation, 'client:root', {
            id: '1',
          }),
          references,
          null, // operationLoader
        ),
      ).toThrow(
        'RelayReferenceMarker: Expected an operationLoader to be configured when ' +
          'using `@module`. Could not load fragment `RelayReferenceMarkerTest2PlainUserNameRenderer_name` ' +
          'in operation `RelayReferenceMarkerTest6Query`.',
      );
    });
  });

  describe('when @defer directive is present', () => {
    let Query;

    beforeEach(() => {
      graphql`
        fragment RelayReferenceMarkerTest5Fragment on Feedback {
          id
          actors {
            name
          }
        }
      `;
      Query = getRequest(graphql`
        query RelayReferenceMarkerTest7Query($id: ID!) {
          node(id: $id) {
            ...RelayReferenceMarkerTest5Fragment @defer(label: "TestFragment")
          }
        }
      `);
    });

    it('marks references when deferred selections are fetched', () => {
      const storeData = {
        '1': {
          __id: '1',
          __typename: 'Feedback',
          id: '1',
          actors: {__refs: ['2']},
        },
        '2': {
          __id: '2',
          __typename: 'User',
          id: '2',
          name: 'Alice',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      const recordSource = RelayRecordSource.create(storeData);
      const references = new Set();
      mark(
        recordSource,
        createNormalizationSelector(Query.operation, 'client:root', {id: '1'}),
        references,
      );
      expect(Array.from(references).sort()).toEqual(['1', '2', 'client:root']);
    });

    it('marks references when deferred selections are not fetched', () => {
      const storeData = {
        '1': {
          __id: '1',
          __typename: 'Feedback',
          id: '1',
          // actors not fetched
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      const recordSource = RelayRecordSource.create(storeData);
      const references = new Set();
      mark(
        recordSource,
        createNormalizationSelector(Query.operation, 'client:root', {id: '1'}),
        references,
      );
      expect(Array.from(references).sort()).toEqual(['1', 'client:root']);
    });
  });

  describe('when @stream directive is present', () => {
    let Query;

    beforeEach(() => {
      graphql`
        fragment RelayReferenceMarkerTest6Fragment on Feedback {
          id
          actors @stream(label: "TestFragmentActors", initial_count: 0) {
            name
          }
        }
      `;
      Query = getRequest(graphql`
        query RelayReferenceMarkerTest8Query($id: ID!) {
          node(id: $id) {
            ...RelayReferenceMarkerTest6Fragment
          }
        }
      `);
    });

    it('marks references when streamed selections are fetched', () => {
      const storeData = {
        '1': {
          __id: '1',
          __typename: 'Feedback',
          id: '1',
          actors: {__refs: ['2']},
        },
        '2': {
          __id: '2',
          __typename: 'User',
          id: '2',
          name: 'Alice',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      const recordSource = RelayRecordSource.create(storeData);
      const references = new Set();
      mark(
        recordSource,
        createNormalizationSelector(Query.operation, 'client:root', {id: '1'}),
        references,
      );
      expect(Array.from(references).sort()).toEqual(['1', '2', 'client:root']);
    });

    it('marks references when streamed selections are not fetched', () => {
      const storeData = {
        '1': {
          __id: '1',
          __typename: 'Feedback',
          id: '1',
          // actors not fetched
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      const recordSource = RelayRecordSource.create(storeData);
      const references = new Set();
      mark(
        recordSource,
        createNormalizationSelector(Query.operation, 'client:root', {id: '1'}),
        references,
      );
      expect(Array.from(references).sort()).toEqual(['1', 'client:root']);
    });
  });

  describe('with feature ENABLE_REACT_FLIGHT_COMPONENT_FIELD', () => {
    let FlightQuery;
    let InnerQuery;
    let operationLoader;

    const readRoot = () => {
      return {
        $$typeof: Symbol.for('react.element'),
        type: 'div',
        key: null,
        ref: null,
        props: {foo: 1},
      };
    };

    beforeEach(() => {
      RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = true;

      FlightQuery = getRequest(graphql`
        query RelayReferenceMarkerTestFlightQuery($id: ID!, $count: Int!) {
          node(id: $id) {
            ... on Story {
              flightComponent(condition: true, count: $count, id: $id)
            }
          }
        }
      `);
      InnerQuery = getRequest(graphql`
        query RelayReferenceMarkerTestInnerQuery($id: ID!) {
          node(id: $id) {
            ... on User {
              name
            }
          }
        }
      `);
      operationLoader = {
        get: jest.fn(() => getRequest(InnerQuery)),
        load: jest.fn(() => Promise.resolve(getRequest(InnerQuery))),
      };
    });
    afterEach(() => {
      RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = false;
    });

    it('marks references when Flight fields are fetched', () => {
      const data = {
        '1': {
          __id: '1',
          __typename: 'Story',
          'flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})':
            {
              __ref:
                'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})',
            },
          id: '1',
        },
        '2': {
          __id: '2',
          __typename: 'User',
          id: '2',
          name: 'Lauren',
        },
        'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})':
          {
            __id: 'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})',
            __typename: 'ReactFlightComponent',
            executableDefinitions: [
              {
                module: {
                  __dr: 'RelayFlightExampleQuery.graphql',
                },
                variables: {
                  id: '2',
                },
              },
            ],
            tree: {
              readRoot,
            },
          },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {
            __ref: '1',
          },
          'node(id:"2")': {
            __ref: '2',
          },
        },
      };
      const recordSource = RelayRecordSource.create(data);
      const references = new Set();
      mark(
        recordSource,
        createNormalizationSelector(FlightQuery.operation, 'client:root', {
          count: 10,
          id: '1',
        }),
        references,
        operationLoader,
      );
      expect(Array.from(references).sort()).toEqual([
        '1',
        '2',
        'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})',
        'client:root',
      ]);
    });

    it('marks references when the Flight field exists but has not been processed', () => {
      const data = {
        '1': {
          __id: '1',
          __typename: 'Story',
          'flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})':
            {
              __ref:
                'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})',
            },
          id: '1',
        },
        'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})':
          {
            __id: 'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})',
            __typename: 'ReactFlightComponent',
          },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {
            __ref: '1',
          },
        },
      };
      const recordSource = RelayRecordSource.create(data);
      const references = new Set();
      mark(
        recordSource,
        createNormalizationSelector(FlightQuery.operation, 'client:root', {
          count: 10,
          id: '1',
        }),
        references,
        operationLoader,
      );
      expect(Array.from(references).sort()).toEqual([
        '1',
        'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})',
        'client:root',
      ]);
    });

    it('marks references when the Flight field is null', () => {
      const data = {
        '1': {
          __id: '1',
          __typename: 'Story',
          'flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})':
            {
              __ref:
                'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})',
            },
          id: '1',
        },
        'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})':
          null,
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {
            __ref: '1',
          },
        },
      };
      const recordSource = RelayRecordSource.create(data);
      const references = new Set();
      mark(
        recordSource,
        createNormalizationSelector(FlightQuery.operation, 'client:root', {
          count: 10,
          id: '1',
        }),
        references,
        operationLoader,
      );
      expect(Array.from(references).sort()).toEqual([
        '1',
        'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})',
        'client:root',
      ]);
    });

    it('marks references when the Flight field is undefined', () => {
      const data = {
        '1': {
          __id: '1',
          __typename: 'Story',
          'flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})':
            {
              __ref:
                'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})',
            },
          id: '1',
        },
        'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})':
          undefined,
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {
            __ref: '1',
          },
        },
      };
      const recordSource = RelayRecordSource.create(data);
      const references = new Set();
      mark(
        recordSource,
        createNormalizationSelector(FlightQuery.operation, 'client:root', {
          count: 10,
          id: '1',
        }),
        references,
        operationLoader,
      );
      expect(Array.from(references).sort()).toEqual([
        '1',
        'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})',
        'client:root',
      ]);
    });

    it('marks references when the linked ReactFlightClientResponseRecord is missing', () => {
      const data = {
        '1': {
          __id: '1',
          __typename: 'Story',
          'flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})':
            {
              __ref:
                'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})',
            },
          id: '1',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {
            __ref: '1',
          },
        },
      };
      const recordSource = RelayRecordSource.create(data);
      const references = new Set();
      mark(
        recordSource,
        createNormalizationSelector(FlightQuery.operation, 'client:root', {
          count: 10,
          id: '1',
        }),
        references,
        operationLoader,
      );
      expect(Array.from(references).sort()).toEqual([
        '1',
        'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})',
        'client:root',
      ]);
    });
  });
});
