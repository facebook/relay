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

jest.mock('generateClientID');

const RelayInMemoryRecordSource = require('../RelayInMemoryRecordSource');
const RelayModernTestUtils = require('RelayModernTestUtils');

const {mark} = require('../RelayReferenceMarker');
const {ROOT_ID} = require('../RelayStoreUtils');

describe('RelayReferenceMarker', () => {
  const {generateAndCompile} = RelayModernTestUtils;
  let source;

  beforeEach(() => {
    jest.resetModules();

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

    source = new RelayInMemoryRecordSource(data);
  });

  it('marks referenced records', () => {
    const {FooQuery} = generateAndCompile(
      `
      query FooQuery($id: ID, $size: [Int]) {
        node(id: $id) {
          id
          __typename
          ... on Page {
            actors {
              name
            }
          }
          ...UserProfile @arguments(size: $size)
        }
      }

      fragment UserProfile on User @argumentDefinitions(
        size: {type: "[Int]"}
      ) {
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
    `,
    );
    const references = new Set();
    mark(
      source,
      {
        dataID: ROOT_ID,
        node: FooQuery.operation,
        variables: {id: '1', size: 32},
      },
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
    source = new RelayInMemoryRecordSource(data);
    const {UserProfile} = generateAndCompile(
      `
      query UserProfile($id: ID!) {
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
    `,
    );
    const references = new Set();
    mark(
      source,
      {
        dataID: ROOT_ID,
        node: UserProfile.operation,
        variables: {id: '1'},
      },
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
    source = new RelayInMemoryRecordSource(data);
    const {UserProfile} = generateAndCompile(
      `
      query UserProfile($id: ID!, $orderby: [String]) {
        node(id: $id) {
          ... on User {
            friends(first: 1, orderby: $orderby) @__clientField(
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
    `,
    );
    let references = new Set();
    mark(
      source,
      {
        dataID: ROOT_ID,
        node: UserProfile.operation,
        variables: {id: '1', orderby: ['first name']},
      },
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
      {
        dataID: ROOT_ID,
        node: UserProfile.operation,
        variables: {id: '1', orderby: ['last name']},
      },
      references,
    );
    expect(Array.from(references).sort()).toEqual([
      '1',
      'client:bestFriendsByLastName',
      'client:root',
    ]);
  });

  describe('when using a @match field', () => {
    let BarQuery;
    let loader;

    beforeEach(() => {
      const nodes = generateAndCompile(`
        fragment PlainUserNameRenderer_name on PlainUserNameRenderer {
          plaintext
          data {
            text
          }
        }

        fragment MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
          markdown
          data {
            markup
          }
        }

        fragment BarFragment on User {
          id
          nameRenderer @match {
            ...PlainUserNameRenderer_name
              @module(name: "PlainUserNameRenderer.react")
            ...MarkdownUserNameRenderer_name
              @module(name: "MarkdownUserNameRenderer.react")
          }
        }

        query BarQuery($id: ID!) {
          node(id: $id) {
            ...BarFragment
          }
        }
      `);
      BarQuery = nodes.BarQuery;
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
          'nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])': {
            __ref:
              'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
          },
        },
        'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])': {
          __id:
            'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
          __typename: 'PlainUserNameRenderer',
          __match_component: 'PlainUserNameRenderer.react',
          __match_fragment: 'PlainUserNameRenderer_name$normalization.graphql',
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
      source = new RelayInMemoryRecordSource(storeData);
      const references = new Set();
      mark(
        source,
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
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
          'nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])': {
            __ref:
              'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
          },
        },
        'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])': {
          __id:
            'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
          __typename: 'MarkdownUserNameRenderer',
          __match_component: 'MarkdownUserNameRenderer.react',
          __match_fragment:
            'MarkdownUserNameRenderer_name$normalization.graphql',
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
      source = new RelayInMemoryRecordSource(storeData);
      const references = new Set();
      mark(
        source,
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
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
          'nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])': {
            __ref:
              'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
          },
        },
        'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])': {
          __id:
            'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
          __typename: 'MarkdownUserNameRenderer',
          // NOTE: markdown/data fields are missing, data not processed.
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      source = new RelayInMemoryRecordSource(storeData);
      const references = new Set();
      mark(
        source,
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
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
          'nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])': {
            __ref:
              'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
          },
        },
        'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])': {
          __id:
            'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
          __typename: 'MarkdownUserNameRenderer',
          __match_component: 'MarkdownUserNameRenderer.react',
          __match_fragment:
            'MarkdownUserNameRenderer_name$normalization.graphql',
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
      source = new RelayInMemoryRecordSource(storeData);
      const references = new Set();
      mark(
        source,
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
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
          'nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])': {
            __ref:
              'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
          },
        },
        'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])': {
          __id:
            'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
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
      source = new RelayInMemoryRecordSource(storeData);
      const references = new Set();
      mark(
        source,
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
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
          'nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])': {
            __ref:
              'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
          },
        },
        'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])': {
          __id:
            'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
          __typename: 'CustomNameRenderer',
          customField: 'custom value',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      source = new RelayInMemoryRecordSource(storeData);
      const references = new Set();
      mark(
        source,
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
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
          'nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])': null,
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      source = new RelayInMemoryRecordSource(storeData);
      const references = new Set();
      mark(
        source,
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
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
      source = new RelayInMemoryRecordSource(storeData);
      const references = new Set();
      mark(
        source,
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
        references,
        loader,
      );
      expect(Array.from(references).sort()).toEqual(['1', 'client:root']);
    });
  });
});
