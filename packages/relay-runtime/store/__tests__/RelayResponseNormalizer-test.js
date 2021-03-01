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

'use strict';

const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernRecord = require('../RelayModernRecord');
const RelayModernTestUtils = require('relay-test-utils-internal');
const RelayRecordSourceMapImpl = require('../RelayRecordSourceMapImpl');

const defaultGetDataID = require('../defaultGetDataID');
const warning = require('warning');

const {graphql, getRequest} = require('../../query/GraphQLTag');
const {createNormalizationSelector} = require('../RelayModernSelector');
const {normalize} = require('../RelayResponseNormalizer');
const {ROOT_ID, ROOT_TYPE} = require('../RelayStoreUtils');

describe('RelayResponseNormalizer', () => {
  const {matchers} = RelayModernTestUtils;

  const defaultOptions = {
    getDataID: defaultGetDataID,
    treatMissingFieldsAsNull: false,
  };

  beforeEach(() => {
    jest.resetModules();
    // $FlowFixMe[incompatible-call]
    expect.extend(matchers);
  });

  it('normalizes queries', () => {
    jest.mock('warning');

    const FooQuery = graphql`
      query RelayResponseNormalizerTest1Query($id: ID, $size: [Int]) {
        node(id: $id) {
          id
          __typename
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
      }
    `;
    const payload = {
      node: {
        id: '1',
        __typename: 'User',
        firstName: 'Alice',
        friends: {
          edges: [
            {
              cursor: 'cursor:2',
              node: {
                id: '2',
                firstName: 'Bob',
              },
            },
            null,
            {
              cursor: 'cursor:3',
              node: {
                id: '3',
                firstName: 'Claire',
              },
            },
          ],
        },
        profilePicture: {
          uri: 'https://...',
        },
      },
    };
    const recordSource = new RelayRecordSourceMapImpl();
    recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
    normalize(
      recordSource,
      createNormalizationSelector(getRequest(FooQuery).operation, ROOT_ID, {
        id: '1',
        size: 32,
      }),
      payload,
      defaultOptions,
    );
    const friendsID = 'client:1:friends(first:3)';
    const edgeID1 = `${friendsID}:edges:0`;
    const edgeID2 = `${friendsID}:edges:2`;
    const pictureID = 'client:1:profilePicture(size:32)';
    expect(recordSource.toJSON()).toEqual({
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        firstName: 'Alice',
        'friends(first:3)': {__ref: friendsID},
        'profilePicture(size:32)': {__ref: pictureID},
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
      [friendsID]: {
        __id: friendsID,
        __typename: 'FriendsConnection',
        edges: {
          __refs: [edgeID1, null, edgeID2],
        },
      },
      [edgeID1]: {
        __id: edgeID1,
        __typename: 'FriendsEdge',
        cursor: 'cursor:2',
        node: {__ref: '2'},
      },
      [edgeID2]: {
        __id: edgeID2,
        __typename: 'FriendsEdge',
        cursor: 'cursor:3',
        node: {__ref: '3'},
      },
      [pictureID]: {
        __id: pictureID,
        __typename: 'Image',
        uri: 'https://...',
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"1")': {__ref: '1'},
      },
    });
  });

  it('normalizes queries with "handle" fields', () => {
    const UserFriends = graphql`
      query RelayResponseNormalizerTest2Query($id: ID!) {
        node(id: $id) {
          id
          __typename
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
    `;

    const payload = {
      node: {
        id: '4',
        __typename: 'User',
        friends: {
          edges: [
            {
              cursor: 'cursor:bestFriends',
              node: {
                id: 'pet',
                name: 'Beast',
              },
            },
          ],
        },
      },
    };
    const recordSource = new RelayRecordSourceMapImpl();
    recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
    const {fieldPayloads} = normalize(
      recordSource,
      createNormalizationSelector(getRequest(UserFriends).operation, ROOT_ID, {
        id: '1',
      }),
      payload,
      defaultOptions,
    );
    if (!Array.isArray(fieldPayloads)) {
      throw new Error('Expect `fieldPayloads` to be an Array.');
    }
    expect(recordSource.toJSON()).toMatchSnapshot();
    expect(fieldPayloads.length).toBe(2);
    expect(fieldPayloads[0]).toEqual({
      args: {},
      dataID: 'pet',
      fieldKey: 'name',
      handle: 'friendsName',
      handleArgs: {},
      handleKey: '__name_friendsName',
    });
    expect(fieldPayloads[1]).toEqual({
      args: {first: 1},
      dataID: '4',
      fieldKey: 'friends(first:1)',
      handle: 'bestFriends',
      handleArgs: {},
      handleKey: '__friends_bestFriends',
    });
  });

  it('normalizes queries with "filters"', () => {
    const UserFriends = graphql`
      query RelayResponseNormalizerTest3Query(
        $id: ID!
        $orderBy: [String]
        $isViewerFriend: Boolean
      ) {
        node(id: $id) {
          id
          __typename
          ... on User {
            friends(
              first: 1
              orderby: $orderBy
              isViewerFriend: $isViewerFriend
            )
              @__clientField(
                handle: "bestFriends"
                key: "UserFriends_friends"
                filters: ["orderby", "isViewerFriend"]
              ) {
              edges {
                cursor
                node {
                  id
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      }
    `;
    const payload1 = {
      node: {
        id: '4',
        __typename: 'User',
        friends: {
          edges: [
            {
              cursor: 'cursor:bestFriends',
              node: {
                id: 'pet',
                name: 'Beast',
              },
            },
          ],
        },
      },
    };

    const recordSource = new RelayRecordSourceMapImpl();
    recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
    let {fieldPayloads} = normalize(
      recordSource,
      createNormalizationSelector(getRequest(UserFriends).operation, ROOT_ID, {
        id: '1',
        orderBy: ['last name'],
        isViewerFriend: true,
      }),
      payload1,
      defaultOptions,
    );
    if (!Array.isArray(fieldPayloads)) {
      throw new Error('Expect `fieldPayloads` to be an Array.');
    }
    expect(recordSource.toJSON()).toMatchSnapshot();
    expect(fieldPayloads.length).toBe(1);
    expect(fieldPayloads[0]).toEqual({
      args: {first: 1, orderby: ['last name'], isViewerFriend: true},
      dataID: '4',
      fieldKey: 'friends(first:1,isViewerFriend:true,orderby:["last name"])',
      handle: 'bestFriends',
      handleArgs: {},
      handleKey:
        '__UserFriends_friends_bestFriends(isViewerFriend:true,orderby:["last name"])',
    });

    const payload2 = {
      node: {
        id: '4',
        __typename: 'User',
        friends: {
          edges: [
            {
              cursor: 'cursor:bestFriends:2',
              node: {
                id: 'cat',
                name: 'Betty',
              },
            },
          ],
        },
      },
    };
    fieldPayloads = normalize(
      recordSource,
      createNormalizationSelector(getRequest(UserFriends).operation, ROOT_ID, {
        id: '1',
        orderBy: ['first name'],
        isViewerFriend: true,
      }),
      payload2,
      defaultOptions,
    ).fieldPayloads;
    if (!Array.isArray(fieldPayloads)) {
      throw new Error('Expect `fieldPayloads` to be an Array.');
    }
    expect(recordSource.toJSON()).toMatchSnapshot();
    expect(fieldPayloads.length).toBe(1);
    expect(fieldPayloads[0]).toEqual({
      args: {first: 1, orderby: ['first name'], isViewerFriend: true},
      dataID: '4',
      fieldKey: 'friends(first:1,isViewerFriend:true,orderby:["first name"])',
      handle: 'bestFriends',
      handleArgs: {},
      handleKey:
        '__UserFriends_friends_bestFriends(isViewerFriend:true,orderby:["first name"])',
    });
  });

  describe('@match', () => {
    let BarQuery;

    beforeEach(() => {
      graphql`
        fragment RelayResponseNormalizerTestPlainUserNameRenderer_name on PlainUserNameRenderer {
          plaintext
          data {
            text
          }
        }
      `;
      graphql`
        fragment RelayResponseNormalizerTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
          markdown
          data {
            markup
          }
        }
      `;
      graphql`
        fragment RelayResponseNormalizerTestFragment on User {
          id
          nameRenderer @match {
            ...RelayResponseNormalizerTestPlainUserNameRenderer_name
              @module(name: "PlainUserNameRenderer.react")
            ...RelayResponseNormalizerTestMarkdownUserNameRenderer_name
              @module(name: "MarkdownUserNameRenderer.react")
          }
        }
      `;
      BarQuery = graphql`
        query RelayResponseNormalizerTest4Query($id: ID!) {
          node(id: $id) {
            ...RelayResponseNormalizerTestFragment
          }
        }
      `;
    });

    it('normalizes queries correctly', () => {
      const payload = {
        node: {
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component_RelayResponseNormalizerTestFragment:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayResponseNormalizerTestFragment:
              'RelayResponseNormalizerTestMarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              markup: '<markup/>',
            },
          },
        },
      };

      const recordSource = new RelayRecordSourceMapImpl();
      recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
      const {moduleImportPayloads} = normalize(
        recordSource,
        createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
          id: '1',
        }),
        payload,
        defaultOptions,
      );
      expect(recordSource.toJSON()).toEqual({
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
          __module_component_RelayResponseNormalizerTestFragment:
            'MarkdownUserNameRenderer.react',
          __module_operation_RelayResponseNormalizerTestFragment:
            'RelayResponseNormalizerTestMarkdownUserNameRenderer_name$normalization.graphql',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      });
      expect(moduleImportPayloads).toEqual([
        {
          operationReference:
            'RelayResponseNormalizerTestMarkdownUserNameRenderer_name$normalization.graphql',
          dataID:
            'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
          data: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component_RelayResponseNormalizerTestFragment:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayResponseNormalizerTestFragment:
              'RelayResponseNormalizerTestMarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              markup: '<markup/>',
            },
          },
          variables: {id: '1'},
          typeName: 'MarkdownUserNameRenderer',
          path: ['node', 'nameRenderer'],
        },
      ]);
    });

    it('returns metadata with prefixed path', () => {
      const payload = {
        node: {
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component_RelayResponseNormalizerTestFragment:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayResponseNormalizerTestFragment:
              'RelayResponseNormalizerTestMarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              markup: '<markup/>',
            },
          },
        },
      };

      const recordSource = new RelayRecordSourceMapImpl();
      recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
      const {moduleImportPayloads} = normalize(
        recordSource,
        createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
          id: '1',
        }),
        payload,
        // simulate a nested @match that appeared, validate that nested payload
        // path is prefixed with this parent path:
        {...defaultOptions, path: ['abc', '0', 'xyz']},
      );
      expect(recordSource.toJSON()).toEqual({
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
          __module_component_RelayResponseNormalizerTestFragment:
            'MarkdownUserNameRenderer.react',
          __module_operation_RelayResponseNormalizerTestFragment:
            'RelayResponseNormalizerTestMarkdownUserNameRenderer_name$normalization.graphql',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      });
      expect(moduleImportPayloads).toEqual([
        {
          operationReference:
            'RelayResponseNormalizerTestMarkdownUserNameRenderer_name$normalization.graphql',
          dataID:
            'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
          data: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component_RelayResponseNormalizerTestFragment:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayResponseNormalizerTestFragment:
              'RelayResponseNormalizerTestMarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              markup: '<markup/>',
            },
          },
          variables: {id: '1'},
          typeName: 'MarkdownUserNameRenderer',
          // parent path followed by local path to @match
          path: ['abc', '0', 'xyz', 'node', 'nameRenderer'],
        },
      ]);
    });

    it('normalizes queries correctly when the resolved type does not match any of the specified cases', () => {
      const payload = {
        node: {
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __typename: 'CustomNameRenderer',
            customField: 'this is ignored!',
          },
        },
      };

      const recordSource = new RelayRecordSourceMapImpl();
      recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
      normalize(
        recordSource,
        createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
          id: '1',
        }),
        payload,
        defaultOptions,
      );
      expect(recordSource.toJSON()).toEqual({
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
          // note: 'customField' data not processed, there is no selection on this type
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      });
    });

    it('normalizes queries correctly when the @match field is null', () => {
      const payload = {
        node: {
          id: '1',
          __typename: 'User',
          nameRenderer: null,
        },
      };

      const recordSource = new RelayRecordSourceMapImpl();
      recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
      normalize(
        recordSource,
        createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
          id: '1',
        }),
        payload,
        defaultOptions,
      );
      expect(recordSource.toJSON()).toEqual({
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
      });
    });
  });

  describe('@module', () => {
    let BarQuery;

    beforeEach(() => {
      graphql`
        fragment RelayResponseNormalizerTest1PlainUserNameRenderer_name on PlainUserNameRenderer {
          plaintext
          data {
            text
          }
        }
      `;
      graphql`
        fragment RelayResponseNormalizerTest1MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
          markdown
          data {
            markup
          }
        }
      `;
      graphql`
        fragment RelayResponseNormalizerTest1Fragment on User {
          id
          nameRenderer {
            # intentionally does not use @match
            ...RelayResponseNormalizerTest1PlainUserNameRenderer_name
              @module(name: "PlainUserNameRenderer.react")
            ...RelayResponseNormalizerTest1MarkdownUserNameRenderer_name
              @module(name: "MarkdownUserNameRenderer.react")
          }
        }
      `;
      BarQuery = graphql`
        query RelayResponseNormalizerTest5Query($id: ID!) {
          node(id: $id) {
            ...RelayResponseNormalizerTest1Fragment
          }
        }
      `;
    });

    it('normalizes queries and returns metadata when the type matches an @module selection', () => {
      const payload = {
        node: {
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component_RelayResponseNormalizerTest1Fragment:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayResponseNormalizerTest1Fragment:
              'RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              markup: '<markup/>',
            },
          },
        },
      };

      const recordSource = new RelayRecordSourceMapImpl();
      recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
      const {moduleImportPayloads} = normalize(
        recordSource,
        createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
          id: '1',
        }),
        payload,
        defaultOptions,
      );
      expect(recordSource.toJSON()).toEqual({
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
          __module_component_RelayResponseNormalizerTest1Fragment:
            'MarkdownUserNameRenderer.react',
          __module_operation_RelayResponseNormalizerTest1Fragment:
            'RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$normalization.graphql',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      });
      expect(moduleImportPayloads).toEqual([
        {
          operationReference:
            'RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$normalization.graphql',
          dataID: 'client:1:nameRenderer',
          data: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component_RelayResponseNormalizerTest1Fragment:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayResponseNormalizerTest1Fragment:
              'RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              markup: '<markup/>',
            },
          },
          variables: {id: '1'},
          typeName: 'MarkdownUserNameRenderer',
          path: ['node', 'nameRenderer'],
        },
      ]);
    });

    it('returns metadata with prefixed path', () => {
      const payload = {
        node: {
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component_RelayResponseNormalizerTest1Fragment:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayResponseNormalizerTest1Fragment:
              'RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              markup: '<markup/>',
            },
          },
        },
      };

      const recordSource = new RelayRecordSourceMapImpl();
      recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
      const {moduleImportPayloads} = normalize(
        recordSource,
        createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
          id: '1',
        }),
        payload,
        // simulate a nested @match that appeared, validate that nested payload
        // path is prefixed with this parent path:
        {...defaultOptions, path: ['abc', '0', 'xyz']},
      );
      expect(recordSource.toJSON()).toEqual({
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
          __module_component_RelayResponseNormalizerTest1Fragment:
            'MarkdownUserNameRenderer.react',
          __module_operation_RelayResponseNormalizerTest1Fragment:
            'RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$normalization.graphql',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      });
      expect(moduleImportPayloads).toEqual([
        {
          operationReference:
            'RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$normalization.graphql',
          dataID: 'client:1:nameRenderer',
          data: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component_RelayResponseNormalizerTest1Fragment:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayResponseNormalizerTest1Fragment:
              'RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              markup: '<markup/>',
            },
          },
          variables: {id: '1'},
          typeName: 'MarkdownUserNameRenderer',
          // parent path followed by local path to @match
          path: ['abc', '0', 'xyz', 'node', 'nameRenderer'],
        },
      ]);
    });

    it('normalizes queries correctly when the resolved type does not match any @module selections', () => {
      const payload = {
        node: {
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __typename: 'CustomNameRenderer',
            customField: 'this is ignored!',
          },
        },
      };

      const recordSource = new RelayRecordSourceMapImpl();
      recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
      normalize(
        recordSource,
        createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
          id: '1',
        }),
        payload,
        defaultOptions,
      );
      expect(recordSource.toJSON()).toEqual({
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
          // note: 'customField' data not processed, there is no selection on this type
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      });
    });
  });

  describe('@defer', () => {
    it('normalizes when if condition is false', () => {
      graphql`
        fragment RelayResponseNormalizerTest2Fragment on User {
          id
          name
        }
      `;
      const Query = graphql`
        query RelayResponseNormalizerTest6Query(
          $id: ID!
          $enableDefer: Boolean!
        ) {
          node(id: $id) {
            ...RelayResponseNormalizerTest2Fragment
              @defer(label: "TestFragment", if: $enableDefer)
          }
        }
      `;
      const payload = {
        node: {
          id: '1',
          __typename: 'User',
          name: 'Alice',
        },
      };

      const recordSource = new RelayRecordSourceMapImpl();
      recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
      const {incrementalPlaceholders} = normalize(
        recordSource,
        createNormalizationSelector(getRequest(Query).operation, ROOT_ID, {
          id: '1',
          enableDefer: false,
        }),
        payload,
        defaultOptions,
      );
      expect(incrementalPlaceholders).toEqual([]);
      expect(recordSource.toJSON()).toEqual({
        '1': {
          __id: '1',
          __typename: 'User',
          id: '1',
          name: 'Alice',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      });
    });

    it('returns metadata when `if` is true (literal value)', () => {
      graphql`
        fragment RelayResponseNormalizerTest3Fragment on User {
          id
          name
        }
      `;
      const Query = graphql`
        query RelayResponseNormalizerTest7Query($id: ID!) {
          node(id: $id) {
            ...RelayResponseNormalizerTest3Fragment
              @defer(label: "TestFragment", if: true)
          }
        }
      `;
      const payload = {
        node: {
          id: '1',
          __typename: 'User',
          name: 'Alice',
        },
      };

      const recordSource = new RelayRecordSourceMapImpl();
      recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
      const {incrementalPlaceholders} = normalize(
        recordSource,
        createNormalizationSelector(getRequest(Query).operation, ROOT_ID, {
          id: '1',
        }),
        payload,
        defaultOptions,
      );
      expect(incrementalPlaceholders).toEqual([
        {
          kind: 'defer',
          data: payload.node,
          label: 'RelayResponseNormalizerTest7Query$defer$TestFragment',
          path: ['node'],
          selector: createNormalizationSelector(
            expect.objectContaining({kind: 'Defer'}),
            '1',
            {id: '1'},
          ),
          typeName: 'User',
        },
      ]);
      expect(recordSource.toJSON()).toEqual({
        '1': {
          __id: '1',
          __typename: 'User',
          id: '1',
          // 'name' not normalized even though its present in the payload
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      });
    });

    it('returns metadata when `if` is true (variable value)', () => {
      graphql`
        fragment RelayResponseNormalizerTest4Fragment on User {
          id
          name
        }
      `;
      const Query = graphql`
        query RelayResponseNormalizerTest8Query(
          $id: ID!
          $enableDefer: Boolean!
        ) {
          node(id: $id) {
            ...RelayResponseNormalizerTest4Fragment
              @defer(label: "TestFragment", if: $enableDefer)
          }
        }
      `;

      const payload = {
        node: {
          id: '1',
          __typename: 'User',
          name: 'Alice',
        },
      };

      const recordSource = new RelayRecordSourceMapImpl();
      recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
      const {incrementalPlaceholders} = normalize(
        recordSource,
        createNormalizationSelector(getRequest(Query).operation, ROOT_ID, {
          id: '1',
          enableDefer: true,
        }),
        payload,
        defaultOptions,
      );
      expect(incrementalPlaceholders).toEqual([
        {
          kind: 'defer',
          data: payload.node,
          label: 'RelayResponseNormalizerTest8Query$defer$TestFragment',
          path: ['node'],
          selector: createNormalizationSelector(
            expect.objectContaining({kind: 'Defer'}),
            '1',
            {id: '1', enableDefer: true},
          ),
          typeName: 'User',
        },
      ]);
      expect(recordSource.toJSON()).toEqual({
        '1': {
          __id: '1',
          __typename: 'User',
          id: '1',
          // 'name' not normalized even though its present in the payload
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      });
    });

    it('returns metadata for @defer within a plural', () => {
      graphql`
        fragment RelayResponseNormalizerTest5Fragment on User {
          name
        }
      `;
      const Query = graphql`
        query RelayResponseNormalizerTest9Query($id: ID!) {
          node(id: $id) {
            ... on Feedback {
              actors {
                ...RelayResponseNormalizerTest5Fragment
                  @defer(label: "TestFragment", if: true)
              }
            }
          }
        }
      `;

      const payload = {
        node: {
          id: '1',
          __typename: 'Feedback',
          actors: [
            {__typename: 'User', id: '2', name: 'Alice'},
            {__typename: 'User', id: '3', name: 'Bob'},
          ],
        },
      };

      const recordSource = new RelayRecordSourceMapImpl();
      recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
      const {incrementalPlaceholders} = normalize(
        recordSource,
        createNormalizationSelector(getRequest(Query).operation, ROOT_ID, {
          id: '1',
        }),
        payload,
        defaultOptions,
      );
      expect(incrementalPlaceholders).toEqual([
        {
          kind: 'defer',
          data: payload.node.actors[0],
          label: 'RelayResponseNormalizerTest9Query$defer$TestFragment',
          path: ['node', 'actors', '0'],
          selector: createNormalizationSelector(
            expect.objectContaining({kind: 'Defer'}),
            '2',
            {id: '1'},
          ),
          typeName: 'User',
        },
        {
          kind: 'defer',
          data: payload.node.actors[1],
          label: 'RelayResponseNormalizerTest9Query$defer$TestFragment',
          path: ['node', 'actors', '1'],
          selector: createNormalizationSelector(
            expect.objectContaining({kind: 'Defer'}),
            '3',
            {id: '1'},
          ),
          typeName: 'User',
        },
      ]);
      expect(recordSource.toJSON()).toEqual({
        '1': {
          __id: '1',
          __typename: 'Feedback',
          id: '1',
          actors: {__refs: ['2', '3']},
        },
        '2': {
          __id: '2',
          __typename: 'User',
          id: '2',
          // name deferred
        },
        '3': {
          __id: '3',
          __typename: 'User',
          id: '3',
          // name deferred
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      });
    });

    it('returns metadata with prefixed path', () => {
      graphql`
        fragment RelayResponseNormalizerTest6Fragment on User {
          id
          name
        }
      `;
      const Query = graphql`
        query RelayResponseNormalizerTest10Query($id: ID!) {
          node(id: $id) {
            ...RelayResponseNormalizerTest6Fragment
              @defer(label: "TestFragment")
          }
        }
      `;
      const payload = {
        node: {
          id: '1',
          __typename: 'User',
        },
      };

      const recordSource = new RelayRecordSourceMapImpl();
      recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
      const {incrementalPlaceholders} = normalize(
        recordSource,
        createNormalizationSelector(getRequest(Query).operation, ROOT_ID, {
          id: '1',
        }),
        payload,
        // simulate a nested defer payload, verify that the incrementalPlaceholders
        // paths are prefixed with this parent path
        {...defaultOptions, path: ['abc', '0', 'xyz']},
      );
      expect(incrementalPlaceholders).toEqual([
        {
          kind: 'defer',
          data: payload.node,
          label: 'RelayResponseNormalizerTest10Query$defer$TestFragment',
          path: ['abc', '0', 'xyz', 'node'],
          selector: createNormalizationSelector(
            expect.objectContaining({kind: 'Defer'}),
            '1',
            {id: '1'},
          ),
          typeName: 'User',
        },
      ]);
    });
  });

  describe('@stream', () => {
    it('normalizes when if condition is false', () => {
      graphql`
        fragment RelayResponseNormalizerTest7Fragment on Feedback {
          id
          actors @stream(label: "actors", if: $enableStream, initial_count: 0) {
            name
          }
        }
      `;
      const Query = graphql`
        query RelayResponseNormalizerTest11Query(
          $id: ID!
          $enableStream: Boolean!
        ) {
          node(id: $id) {
            ...RelayResponseNormalizerTest7Fragment
          }
        }
      `;
      const payload = {
        node: {
          id: '1',
          __typename: 'Feedback',
          actors: [{__typename: 'User', id: '2', name: 'Alice'}],
        },
      };

      const recordSource = new RelayRecordSourceMapImpl();
      recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
      const {incrementalPlaceholders} = normalize(
        recordSource,
        createNormalizationSelector(getRequest(Query).operation, ROOT_ID, {
          id: '1',
          enableStream: false,
        }),
        payload,
        defaultOptions,
      );
      expect(incrementalPlaceholders).toEqual([]);
      expect(recordSource.toJSON()).toEqual({
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
      });
    });

    it('normalizes and returns metadata when `if` is true (literal value)', () => {
      graphql`
        fragment RelayResponseNormalizerTest8Fragment on Feedback {
          id
          actors @stream(label: "actors", if: true, initial_count: 0) {
            name
          }
        }
      `;
      const Query = graphql`
        query RelayResponseNormalizerTestQuery($id: ID!) {
          node(id: $id) {
            ...RelayResponseNormalizerTest8Fragment
          }
        }
      `;

      const payload = {
        node: {
          id: '1',
          __typename: 'Feedback',
          actors: [{__typename: 'User', id: '2', name: 'Alice'}],
        },
      };

      const recordSource = new RelayRecordSourceMapImpl();
      recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
      const {incrementalPlaceholders} = normalize(
        recordSource,
        createNormalizationSelector(getRequest(Query).operation, ROOT_ID, {
          id: '1',
        }),
        payload,
        defaultOptions,
      );
      expect(incrementalPlaceholders).toEqual([
        {
          kind: 'stream',
          label: 'RelayResponseNormalizerTest8Fragment$stream$actors',
          path: ['node'],
          parentID: '1',
          node: expect.objectContaining({kind: 'Stream'}),
          variables: {id: '1'},
        },
      ]);
      expect(recordSource.toJSON()).toEqual({
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
      });
    });

    it('normalizes and returns metadata when `if` is true (variable value)', () => {
      graphql`
        fragment RelayResponseNormalizerTest9Fragment on Feedback {
          id
          actors @stream(label: "actors", if: $enableStream, initial_count: 0) {
            name
          }
        }
      `;
      const Query = graphql`
        query RelayResponseNormalizerTest12Query(
          $id: ID!
          $enableStream: Boolean!
        ) {
          node(id: $id) {
            ...RelayResponseNormalizerTest9Fragment
          }
        }
      `;

      const payload = {
        node: {
          id: '1',
          __typename: 'Feedback',
          actors: [{__typename: 'User', id: '2', name: 'Alice'}],
        },
      };

      const recordSource = new RelayRecordSourceMapImpl();
      recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
      const {incrementalPlaceholders} = normalize(
        recordSource,
        createNormalizationSelector(getRequest(Query).operation, ROOT_ID, {
          id: '1',
          enableStream: true,
        }),
        payload,
        defaultOptions,
      );
      expect(incrementalPlaceholders).toEqual([
        {
          kind: 'stream',
          label: 'RelayResponseNormalizerTest9Fragment$stream$actors',
          path: ['node'],
          parentID: '1',
          node: expect.objectContaining({kind: 'Stream'}),
          variables: {id: '1', enableStream: true},
        },
      ]);
      expect(recordSource.toJSON()).toEqual({
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
      });
    });

    it('normalizes and returns metadata for @stream within a plural', () => {
      graphql`
        fragment RelayResponseNormalizerTest10Fragment on Feedback {
          id
          actors {
            ... on User {
              name
              actors @stream(label: "actors", if: true, initial_count: 0) {
                name
              }
            }
          }
        }
      `;
      const Query = graphql`
        query RelayResponseNormalizerTest13Query($id: ID!) {
          node(id: $id) {
            ...RelayResponseNormalizerTest10Fragment
          }
        }
      `;
      const payload = {
        node: {
          id: '1',
          __typename: 'Feedback',
          actors: [
            {__typename: 'User', id: '2', name: 'Alice', actors: []},
            {__typename: 'User', id: '3', name: 'Bob', actors: []},
          ],
        },
      };

      const recordSource = new RelayRecordSourceMapImpl();
      recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
      const {incrementalPlaceholders} = normalize(
        recordSource,
        createNormalizationSelector(getRequest(Query).operation, ROOT_ID, {
          id: '1',
        }),
        payload,
        defaultOptions,
      );
      expect(incrementalPlaceholders).toEqual([
        {
          kind: 'stream',
          label: 'RelayResponseNormalizerTest10Fragment$stream$actors',
          path: ['node', 'actors', '0'],
          parentID: '2',
          variables: {id: '1'},
          node: expect.objectContaining({kind: 'Stream'}),
        },
        {
          kind: 'stream',
          label: 'RelayResponseNormalizerTest10Fragment$stream$actors',
          path: ['node', 'actors', '1'],
          parentID: '3',
          variables: {id: '1'},
          node: expect.objectContaining({kind: 'Stream'}),
        },
      ]);
      expect(recordSource.toJSON()).toEqual({
        '1': {
          __id: '1',
          __typename: 'Feedback',
          id: '1',
          actors: {__refs: ['2', '3']},
        },
        '2': {
          __id: '2',
          __typename: 'User',
          id: '2',
          name: 'Alice',
          actors: {__refs: []},
        },
        '3': {
          __id: '3',
          __typename: 'User',
          id: '3',
          name: 'Bob',
          actors: {__refs: []},
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      });
    });

    it('returns metadata with prefixed path', () => {
      graphql`
        fragment RelayResponseNormalizerTest11Fragment on Feedback {
          id
          actors @stream(label: "actors", initial_count: 0) {
            name
          }
        }
      `;
      const Query = graphql`
        query RelayResponseNormalizerTest14Query($id: ID!) {
          node(id: $id) {
            ...RelayResponseNormalizerTest11Fragment
          }
        }
      `;

      const payload = {
        node: {
          id: '1',
          __typename: 'Feedback',
          actors: [{__typename: 'User', id: '2', name: 'Alice'}],
        },
      };

      const recordSource = new RelayRecordSourceMapImpl();
      recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
      const {incrementalPlaceholders} = normalize(
        recordSource,
        createNormalizationSelector(getRequest(Query).operation, ROOT_ID, {
          id: '1',
        }),
        payload,
        // simulate a nested @match that appeared, validate that nested payload
        // path is prefixed with this parent path:
        {...defaultOptions, path: ['abc', '0', 'xyz']},
      );
      expect(incrementalPlaceholders).toEqual([
        {
          kind: 'stream',
          label: 'RelayResponseNormalizerTest11Fragment$stream$actors',
          path: ['abc', '0', 'xyz', 'node'],
          parentID: '1',
          variables: {id: '1'},
          node: expect.objectContaining({kind: 'Stream'}),
        },
      ]);
    });
  });

  describe('Client Extensions', () => {
    const StrippedQuery = graphql`
      query RelayResponseNormalizerTestStrippedQuery($id: ID) {
        node(id: $id) {
          id
          __typename
          ... on User {
            firstName
            nickname
            foo {
              bar {
                content
              }
            }
          }
        }
      }
    `;

    const payload = {
      node: {
        id: '1',
        __typename: 'User',
        firstName: 'Bob',
      },
    };

    it('skips client fields not present in the payload but present in the store', () => {
      const recordSource = new RelayRecordSourceMapImpl({
        '1': {
          __id: '1',
          __typename: 'User',
          id: '1',
          firstName: 'Alice',
          nickname: 'ecilA',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      });
      normalize(
        recordSource,
        createNormalizationSelector(
          getRequest(StrippedQuery).operation,
          ROOT_ID,
          {
            id: '1',
            size: 32,
          },
        ),
        payload,
        defaultOptions,
      );
      const result = {
        '1': {
          __id: '1',
          __typename: 'User',
          id: '1',
          firstName: 'Bob',
          nickname: 'ecilA',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      expect(recordSource.toJSON()).toEqual(result);
      normalize(
        recordSource,
        createNormalizationSelector(
          getRequest(StrippedQuery).operation,
          ROOT_ID,
          {
            id: '1',
            size: 32,
          },
        ),
        payload,
        defaultOptions,
      );
      expect(recordSource.toJSON()).toEqual(result);
    });

    it('skips client fields not present in the payload but present in the store when treatMissingFieldsAsNull is true', () => {
      const recordSource = new RelayRecordSourceMapImpl({
        '1': {
          __id: '1',
          __typename: 'User',
          id: '1',
          firstName: 'Alice',
          nickname: 'ecilA',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      });
      normalize(
        recordSource,
        createNormalizationSelector(
          getRequest(StrippedQuery).operation,
          ROOT_ID,
          {
            id: '1',
            size: 32,
          },
        ),
        payload,
        {...defaultOptions, treatMissingFieldsAsNull: true},
      );
      const result = {
        '1': {
          __id: '1',
          __typename: 'User',
          id: '1',
          firstName: 'Bob',
          nickname: 'ecilA',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      expect(recordSource.toJSON()).toEqual(result);
      normalize(
        recordSource,
        createNormalizationSelector(
          getRequest(StrippedQuery).operation,
          ROOT_ID,
          {
            id: '1',
            size: 32,
          },
        ),
        payload,
        defaultOptions,
      );
      expect(recordSource.toJSON()).toEqual(result);
    });

    it('skips client fields not present in the payload or store', () => {
      const recordSource = new RelayRecordSourceMapImpl({
        '1': {
          __id: '1',
          __typename: 'User',
          id: '1',
          firstName: 'Alice',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      });
      normalize(
        recordSource,
        createNormalizationSelector(
          getRequest(StrippedQuery).operation,
          ROOT_ID,
          {
            id: '1',
            size: 32,
          },
        ),
        payload,
        defaultOptions,
      );
      const result = {
        '1': {
          __id: '1',
          __typename: 'User',
          id: '1',
          firstName: 'Bob',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      expect(recordSource.toJSON()).toEqual(result);
      normalize(
        recordSource,
        createNormalizationSelector(
          getRequest(StrippedQuery).operation,
          ROOT_ID,
          {
            id: '1',
            size: 32,
          },
        ),
        payload,
        defaultOptions,
      );
      expect(recordSource.toJSON()).toEqual(result);
    });

    it('ignores linked client fields not present in the payload', () => {
      const recordSource = new RelayRecordSourceMapImpl({
        '1': {
          __id: '1',
          __typename: 'User',
          id: '1',
          firstName: 'Alice',
          foo: {
            __ref: '2',
          },
        },
        '2': {
          __id: '2',
          __typename: 'Foo',
          bar: {
            __ref: '3',
          },
        },
        '3': {
          __id: '3',
          __typename: 'Bar',
          content: 'bar',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      });
      normalize(
        recordSource,
        createNormalizationSelector(
          getRequest(StrippedQuery).operation,
          ROOT_ID,
          {
            id: '1',
            size: 32,
          },
        ),
        payload,
        defaultOptions,
      );
      const result = {
        '1': {
          __id: '1',
          __typename: 'User',
          id: '1',
          firstName: 'Bob',
          foo: {
            __ref: '2',
          },
        },
        '2': {
          __id: '2',
          __typename: 'Foo',
          bar: {
            __ref: '3',
          },
        },
        '3': {
          __id: '3',
          __typename: 'Bar',
          content: 'bar',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      expect(recordSource.toJSON()).toEqual(result);
      normalize(
        recordSource,
        createNormalizationSelector(
          getRequest(StrippedQuery).operation,
          ROOT_ID,
          {
            id: '1',
            size: 32,
          },
        ),
        payload,
        defaultOptions,
      );
      expect(recordSource.toJSON()).toEqual(result);
    });

    it('ignores linked client fields not present in the payload or store', () => {
      const recordSource = new RelayRecordSourceMapImpl({
        '1': {
          __id: '1',
          __typename: 'User',
          id: '1',
          firstName: 'Alice',
          foo: {
            __ref: '2',
          },
        },
        '2': {
          __id: '2',
          __typename: 'Foo',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      });
      normalize(
        recordSource,
        createNormalizationSelector(
          getRequest(StrippedQuery).operation,
          ROOT_ID,
          {
            id: '1',
            size: 32,
          },
        ),
        payload,
        defaultOptions,
      );
      const result = {
        '1': {
          __id: '1',
          __typename: 'User',
          id: '1',
          firstName: 'Bob',
          foo: {
            __ref: '2',
          },
        },
        '2': {
          __id: '2',
          __typename: 'Foo',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      expect(recordSource.toJSON()).toEqual(result);
      normalize(
        recordSource,
        createNormalizationSelector(
          getRequest(StrippedQuery).operation,
          ROOT_ID,
          {
            id: '1',
            size: 32,
          },
        ),
        payload,
        defaultOptions,
      );
      expect(recordSource.toJSON()).toEqual(result);
    });
  });

  describe('User-defined getDataID', () => {
    let recordSource;

    const getDataID = jest.fn((fieldValue, typename) => {
      return `${
        typeof fieldValue === 'string' ? fieldValue : String(fieldValue.id)
      }:${String(typename)}`;
    });

    const getNullAsDataID = jest.fn((fieldValue, typename) => {
      return null;
    });

    beforeEach(() => {
      recordSource = new RelayRecordSourceMapImpl();
      recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('single field', () => {
      const BarQuery = graphql`
        query RelayResponseNormalizerTest15Query($id: ID) {
          node(id: $id) {
            id
            __typename
            ... on User {
              actor {
                id
                __typename
              }
              author {
                id
                __typename
              }
            }
          }
        }
      `;

      const payload = {
        node: {
          id: '1',
          __typename: 'User',
          actor: {
            id: '1',
            __typename: 'Page',
          },
          author: {
            id: '1',
            __typename: 'User',
          },
        },
      };

      it('Overwrite fields in same position but with different data', () => {
        const Foo = graphql`
          query RelayResponseNormalizerTest16Query {
            me {
              author {
                id
                name
              }
            }
            meAgain: me {
              author {
                id
                name
              }
            }
          }
        `;
        const fooPayload = {
          me: {
            __typename: 'User',
            id: 'me',
            author: {
              id: 'friend1',
              name: 'First Friend',
            },
          },
          meAgain: {
            __typename: 'User',
            id: 'me',
            author: {
              id: 'friend2',
              name: 'Second Friend',
            },
          },
        };
        normalize(
          recordSource,
          createNormalizationSelector(getRequest(Foo).operation, ROOT_ID, {
            id: '1',
          }),
          fooPayload,
          {getDataID, treatMissingFieldsAsNull: false},
        );
        expect(recordSource.toJSON()).toEqual({
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            me: {
              __ref: 'me:User',
            },
          },
          'friend1:User': {
            __id: 'friend1:User',
            __typename: 'User',
            id: 'friend1',
            name: 'First Friend',
          },
          'friend2:User': {
            __id: 'friend2:User',
            __typename: 'User',
            id: 'friend2',
            name: 'Second Friend',
          },
          'me:User': {
            __id: 'me:User',
            __typename: 'User',
            author: {
              __ref: 'friend2:User', // Should be the second one
            },
            id: 'me',
          },
        });
      });

      it('Overwrite fields in same position but with different data in second normalization', () => {
        const Foo = graphql`
          query RelayResponseNormalizerTest17Query {
            me {
              author {
                id
                name
              }
            }
          }
        `;
        const fooPayload0 = {
          me: {
            __typename: 'User',
            id: 'me',
            author: {
              id: 'friend0',
              name: 'First Friend',
            },
          },
        };
        const fooPayload1 = {
          me: {
            __typename: 'User',
            id: 'me',
            author: {
              id: 'friend1',
              name: 'Second Friend',
            },
          },
        };
        normalize(
          recordSource,
          createNormalizationSelector(getRequest(Foo).operation, ROOT_ID, {
            id: '1',
          }),
          fooPayload0,
          {getDataID, treatMissingFieldsAsNull: false},
        );
        normalize(
          recordSource,
          createNormalizationSelector(getRequest(Foo).operation, ROOT_ID, {
            id: '1',
          }),
          fooPayload1,
          {getDataID, treatMissingFieldsAsNull: false},
        );
        expect(recordSource.toJSON()).toEqual({
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            me: {
              __ref: 'me:User',
            },
          },
          'friend0:User': {
            __id: 'friend0:User',
            __typename: 'User',
            id: 'friend0',
            name: 'First Friend',
          },
          'friend1:User': {
            __id: 'friend1:User',
            __typename: 'User',
            id: 'friend1',
            name: 'Second Friend',
          },
          'me:User': {
            __id: 'me:User',
            __typename: 'User',
            author: {
              __ref: 'friend1:User', // Should be the second one
            },
            id: 'me',
          },
        });
      });

      it('stores user-defined id when function returns an string', () => {
        normalize(
          recordSource,
          createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
            id: '1',
          }),
          payload,
          {getDataID, treatMissingFieldsAsNull: false},
        );
        expect(recordSource.toJSON()).toEqual({
          '1:Page': {
            __id: '1:Page',
            __typename: 'Page',
            id: '1',
          },
          '1:User': {
            __id: '1:User',
            __typename: 'User',
            actor: {
              __ref: '1:Page',
            },
            author: {
              __ref: '1:User',
            },
            id: '1',
          },
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            'node(id:"1")': {
              __ref: '1:User',
            },
          },
        });
        expect(getDataID).toBeCalledTimes(3);
      });

      it('falls through to previously generated ID if function returns null ', () => {
        const previousData = {
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            'node(id:"1")': {
              __ref: 'test:root:node(id:"1")',
            },
          },
          'test:root:node(id:"1")': {
            __id: 'test:root:node(id:"1")',
            __typename: 'User',
            actor: {
              __ref: 'test:root:node(id:"1"):actor',
            },
            author: {
              __ref: 'test:root:node(id:"1"):author',
            },
            id: '1',
          },
          'test:root:node(id:"1"):actor': {
            __id: 'test:root:node(id:"1"):actor',
            __typename: 'Page',
            id: '1',
          },
          'test:root:node(id:"1"):author': {
            __id: 'test:root:node(id:"1"):author',
            __typename: 'User',
            id: '1',
          },
        };
        const expectedData = JSON.parse(JSON.stringify(previousData));
        recordSource = new RelayRecordSourceMapImpl(previousData);
        normalize(
          recordSource,
          createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
            id: '1',
          }),
          payload,
          {getDataID: getNullAsDataID, treatMissingFieldsAsNull: false},
        );
        expect(recordSource.toJSON()).toEqual(expectedData);
        expect(getNullAsDataID).toBeCalledTimes(3);
      });

      it('falls through to generateClientID when the function returns null, and no previously generated ID', () => {
        normalize(
          recordSource,
          createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
            id: '1',
          }),
          payload,
          {getDataID: getNullAsDataID, treatMissingFieldsAsNull: false},
        );
        expect(recordSource.toJSON()).toEqual({
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            'node(id:"1")': {
              __ref: 'client:root:node(id:"1")',
            },
          },
          'client:root:node(id:"1")': {
            __id: 'client:root:node(id:"1")',
            __typename: 'User',
            actor: {
              __ref: 'client:root:node(id:"1"):actor',
            },
            author: {
              __ref: 'client:root:node(id:"1"):author',
            },
            id: '1',
          },
          'client:root:node(id:"1"):actor': {
            __id: 'client:root:node(id:"1"):actor',
            __typename: 'Page',
            id: '1',
          },
          'client:root:node(id:"1"):author': {
            __id: 'client:root:node(id:"1"):author',
            __typename: 'User',
            id: '1',
          },
        });
        expect(getNullAsDataID).toBeCalledTimes(3);
      });
    });

    describe('plural fileds', () => {
      const BarQuery = graphql`
        query RelayResponseNormalizerTest18Query($id: ID) {
          node(id: $id) {
            id
            __typename
            ... on User {
              actors {
                id
                __typename
              }
            }
          }
        }
      `;

      const payload = {
        node: {
          id: '1',
          __typename: 'User',
          actors: [
            {
              id: '1',
              __typename: 'Page',
            },
            {
              id: '2',
              __typename: 'Page',
            },
          ],
        },
      };

      it('stores user-defined ids when function returns an string', () => {
        normalize(
          recordSource,
          createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
            id: '1',
          }),
          payload,
          {getDataID, treatMissingFieldsAsNull: false},
        );
        expect(recordSource.toJSON()).toEqual({
          '1:Page': {
            __id: '1:Page',
            __typename: 'Page',
            id: '1',
          },
          '2:Page': {
            __id: '2:Page',
            __typename: 'Page',
            id: '2',
          },
          '1:User': {
            __id: '1:User',
            __typename: 'User',
            actors: {
              __refs: ['1:Page', '2:Page'],
            },
            id: '1',
          },
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            'node(id:"1")': {
              __ref: '1:User',
            },
          },
        });
        expect(getDataID).toBeCalledTimes(3);
      });

      it('uses cached IDs if they were generated before and the function returns null', () => {
        const previousData = {
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            'node(id:"1")': {
              __ref: 'test:root:node(id:"1")',
            },
          },
          'test:root:node(id:"1")': {
            __id: 'test:root:node(id:"1")',
            __typename: 'User',
            actors: {
              __refs: [
                'test:root:node(id:"1"):actor:0',
                'test:root:node(id:"1"):actor:1',
              ],
            },
            id: '1',
          },
          'test:root:node(id:"1"):actor:0': {
            __id: 'test:root:node(id:"1"):actor:0',
            __typename: 'Page',
            id: '1',
          },
          'test:root:node(id:"1"):actor:1': {
            __id: 'test:root:node(id:"1"):actor:1',
            __typename: 'Page',
            id: '2',
          },
        };
        recordSource = new RelayRecordSourceMapImpl(previousData);
        const expectedData = JSON.parse(JSON.stringify(previousData));
        normalize(
          recordSource,
          createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
            id: '1',
          }),
          payload,
          {getDataID: getNullAsDataID, treatMissingFieldsAsNull: false},
        );
        expect(recordSource.toJSON()).toEqual(expectedData);
        expect(getNullAsDataID).toBeCalledTimes(3);
      });

      it('falls through to generateClientID when the function returns null and there is one new field in stored plural links', () => {
        const data = {
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            'node(id:"1")': {
              __ref: 'test:root:node(id:"1")',
            },
          },
          'test:root:node(id:"1")': {
            __id: 'test:root:node(id:"1")',
            __typename: 'User',
            actors: {
              __refs: ['test:root:node(id:"1"):actor:0'],
            },
            id: '1',
          },
          'test:root:node(id:"1"):actor:0': {
            __id: 'test:root:node(id:"1"):actor:0',
            __typename: 'Page',
            id: '1',
          },
        };
        recordSource = new RelayRecordSourceMapImpl(data);
        normalize(
          recordSource,
          createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
            id: '1',
          }),
          payload,
          {getDataID: getNullAsDataID, treatMissingFieldsAsNull: false},
        );
        const result = recordSource.toJSON();
        expect(result['test:root:node(id:"1")']).toEqual({
          __id: 'test:root:node(id:"1")',
          __typename: 'User',
          actors: {
            __refs: [
              'test:root:node(id:"1"):actor:0',
              'client:test:root:node(id:"1"):actors:1',
            ],
          },
          id: '1',
        });
        expect(result['client:test:root:node(id:"1"):actors:1']).toEqual({
          __id: 'client:test:root:node(id:"1"):actors:1',
          __typename: 'Page',
          id: '2',
        });
        expect(getNullAsDataID).toBeCalledTimes(3);
      });

      it('falls through to generateClientID when the function returns null and no preiously generated IDs', () => {
        normalize(
          recordSource,
          createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
            id: '1',
          }),
          payload,
          {getDataID: getNullAsDataID, treatMissingFieldsAsNull: false},
        );
        expect(recordSource.toJSON()).toEqual({
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            'node(id:"1")': {
              __ref: 'client:root:node(id:"1")',
            },
          },
          'client:root:node(id:"1")': {
            __id: 'client:root:node(id:"1")',
            __typename: 'User',
            actors: {
              __refs: [
                'client:root:node(id:"1"):actors:0',
                'client:root:node(id:"1"):actors:1',
              ],
            },
            id: '1',
          },
          'client:root:node(id:"1"):actors:0': {
            __id: 'client:root:node(id:"1"):actors:0',
            __typename: 'Page',
            id: '1',
          },
          'client:root:node(id:"1"):actors:1': {
            __id: 'client:root:node(id:"1"):actors:1',
            __typename: 'Page',
            id: '2',
          },
        });
        expect(getNullAsDataID).toBeCalledTimes(3);
      });

      it('Overwrite fields in same position but with different data in second normalization', () => {
        const Foo = graphql`
          query RelayResponseNormalizerTest19Query($id: ID) {
            node(id: $id) {
              id
              __typename
              ... on User {
                actors {
                  id
                  name
                  __typename
                }
              }
            }
          }
        `;

        const payload0 = {
          node: {
            id: '1',
            __typename: 'User',
            actors: [
              {
                id: '1',
                __typename: 'Page',
                name: 'Page0',
              },
            ],
          },
        };
        const payload1 = {
          node: {
            id: '1',
            __typename: 'User',
            actors: [
              {
                id: '2',
                __typename: 'Page',
                name: 'Page1',
              },
            ],
          },
        };
        normalize(
          recordSource,
          createNormalizationSelector(getRequest(Foo).operation, ROOT_ID, {
            id: '1',
          }),
          payload0,
          {getDataID, treatMissingFieldsAsNull: false},
        );
        normalize(
          recordSource,
          createNormalizationSelector(getRequest(Foo).operation, ROOT_ID, {
            id: '1',
          }),
          payload1,
          {getDataID, treatMissingFieldsAsNull: false},
        );
        expect(recordSource.toJSON()).toEqual({
          '1:Page': {
            __id: '1:Page',
            __typename: 'Page',
            id: '1',
            name: 'Page0',
          },
          '2:Page': {
            __id: '2:Page',
            __typename: 'Page',
            id: '2',
            name: 'Page1',
          },
          '1:User': {
            __id: '1:User',
            __typename: 'User',
            actors: {
              __refs: ['2:Page'], // Should be the second one
            },
            id: '1',
          },
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            'node(id:"1")': {
              __ref: '1:User',
            },
          },
        });
      });
    });
  });

  it('warns in __DEV__ if payload data is missing an expected field', () => {
    jest.mock('warning');

    const BarQuery = graphql`
      query RelayResponseNormalizerTest20Query($id: ID) {
        node(id: $id) {
          id
          __typename
          ... on User {
            firstName
            profilePicture(size: 100) {
              uri
            }
          }
        }
      }
    `;

    const payload = {
      node: {
        id: '1',
        __typename: 'User',
        profilePicture: {
          uri: 'https://...',
        },
      },
    };
    const recordSource = new RelayRecordSourceMapImpl();
    recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
    expect(() => {
      normalize(
        recordSource,
        createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
          id: '1',
        }),
        payload,
        defaultOptions,
      );
      /* $FlowFixMe[incompatible-call]*/
    }).toWarn([
      'RelayResponseNormalizer: Payload did not contain a value for ' +
        'field `%s: %s`. Check that you are parsing with the same query that ' +
        'was used to fetch the payload.',
      'firstName',
      'firstName',
    ]);
  });

  it('does not warn in __DEV__ if payload data is missing for an abstract field', () => {
    jest.mock('warning');

    const BarQuery = graphql`
      query RelayResponseNormalizerTest21Query {
        named {
          name
          ... on Node {
            id
          }
        }
      }
    `;

    const payload = {
      named: {
        __typename: 'SimpleNamed',
        name: 'Alice',
      },
    };
    const recordSource = new RelayRecordSourceMapImpl();
    recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
    expect(() => {
      normalize(
        recordSource,
        createNormalizationSelector(
          getRequest(BarQuery).operation,
          ROOT_ID,
          {},
        ),
        payload,
        defaultOptions,
      );
      /* $FlowFixMe[incompatible-call]*/
    }).not.toWarn([
      'RelayResponseNormalizer(): Payload did not contain a value for ' +
        'field `%s: %s`. Check that you are parsing with the same query that ' +
        'was used to fetch the payload.',
      'name',
      'name',
    ]);
  });

  it('warns in __DEV__ if a single response contains conflicting fields with the same id', () => {
    jest.mock('warning');
    const BarQuery = graphql`
      query RelayResponseNormalizerTest22Query($id: ID) {
        node(id: $id) {
          id
          __typename
          ... on User {
            name
            friends(first: 2) {
              edges {
                node {
                  id
                  firstName
                }
              }
            }
          }
        }
      }
    `;

    const payload = {
      node: {
        id: '1',
        __typename: 'User',
        name: 'Alice',
        friends: {
          edges: [
            {
              node: {
                id: 'a',
                firstName: 'Bob',
              },
            },
            {
              node: {
                id: 'a',
                firstName: 'Claire',
              },
            },
          ],
        },
      },
    };
    const recordSource = new RelayRecordSourceMapImpl();
    recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
    normalize(
      recordSource,
      createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
        id: '1',
      }),
      payload,
      defaultOptions,
    );
    expect(warning).toBeCalledWith(
      false,
      expect.stringContaining(
        'RelayResponseNormalizer: Invalid record. The record contains two ' +
          'instances of the same id: `%s` with conflicting field, %s and its values: %s and %s. ' +
          'If two fields are different but share ' +
          'the same id, one field will overwrite the other.',
      ),
      'a',
      'firstName',
      'Bob',
      'Claire',
    );
  });

  it('does not warn if a single response contains the same scalar array value', () => {
    jest.mock('warning');
    (warning: $FlowFixMe).mockClear();
    const BarQuery = graphql`
      query RelayResponseNormalizerTest23Query($id: ID) {
        node(id: $id) {
          id
          __typename
          ... on User {
            name
            friends(first: 2) {
              edges {
                node {
                  id
                  emailAddresses
                }
              }
            }
          }
        }
      }
    `;

    const payload = {
      node: {
        id: '1',
        __typename: 'User',
        name: 'Alice',
        friends: {
          edges: [
            {
              node: {
                id: 'a',
                emailAddresses: ['a@example.com'],
              },
            },
            {
              node: {
                id: 'a',
                emailAddresses: ['a@example.com'], // not same object but deeply equal: should not warn
              },
            },
          ],
        },
      },
    };
    const recordSource = new RelayRecordSourceMapImpl();
    recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
    normalize(
      recordSource,
      createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
        id: '1',
      }),
      payload,
      defaultOptions,
    );
    // There should be no failing warnings (where the first argument is true)
    expect(
      (warning: $FlowFixMe).mock.calls.filter(call => call[0] === false),
    ).toEqual([]);
  });

  it('warns in __DEV__ if a single response contains conflicting fields with multiple same ids', () => {
    jest.mock('warning');
    const BarQuery = graphql`
      query RelayResponseNormalizerTest24Query($id: ID) {
        node(id: $id) {
          id
          __typename
          ... on User {
            name
            friends(first: 4) {
              edges {
                node {
                  id
                  firstName
                }
              }
            }
          }
        }
      }
    `;

    const payload = {
      node: {
        id: '1',
        __typename: 'User',
        name: 'Alice',
        friends: {
          edges: [
            {
              node: {
                id: 'a',
                firstName: 'Bob',
              },
            },
            {
              node: {
                id: 'b',
                firstName: 'Claire',
              },
            },
            {
              node: {
                id: 'a',
                firstName: 'Carlos',
              },
            },
            {
              node: {
                id: 'a',
                firstName: 'Shirley',
              },
            },
          ],
        },
      },
    };
    const recordSource = new RelayRecordSourceMapImpl();
    recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
    normalize(
      recordSource,
      createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
        id: '1',
      }),
      payload,
      defaultOptions,
    );
    expect(warning).toBeCalledWith(
      false,
      expect.stringContaining(
        'RelayResponseNormalizer: Invalid record. The record contains two ' +
          'instances of the same id: `%s` with conflicting field, %s and its values: %s and %s. ' +
          'If two fields are different but share ' +
          'the same id, one field will overwrite the other.',
      ),
      'a',
      'firstName',
      'Bob',
      'Carlos',
    );
  });

  it('warns in __DEV__ if a single response contains conflicting linked fields', () => {
    jest.mock('warning');
    const BarQuery = graphql`
      query RelayResponseNormalizerTest25Query($id: ID) {
        node(id: $id) {
          id
          __typename
          ... on User {
            name
            friends(first: 2) {
              edges {
                node {
                  id
                  firstName
                  comments(first: 1) {
                    edges {
                      node {
                        id
                        body {
                          text
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const payload = {
      node: {
        id: '1',
        __typename: 'User',
        name: 'Alice',
        friends: {
          edges: [
            {
              node: {
                id: 'a',
                firstName: 'Bob',
                comments: {
                  edges: [
                    {
                      node: {
                        id: '2',
                        body: {
                          text: 'Hello World',
                        },
                      },
                    },
                  ],
                },
              },
            },
            {
              node: {
                id: 'a',
                firstName: 'Bob',
                comments: {
                  edges: [
                    {
                      node: {
                        id: '3',
                        body: {
                          text: 'Hello World',
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    };
    const recordSource = new RelayRecordSourceMapImpl();
    recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
    normalize(
      recordSource,
      createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
        id: '1',
      }),
      payload,
      defaultOptions,
    );
    expect(warning).toBeCalledWith(
      false,
      expect.stringContaining(
        'RelayResponseNormalizer: Invalid record. The record contains ' +
          'references to the conflicting field, %s and its id values: %s and %s. ' +
          'We need to make sure that the record the field points ' +
          'to remains consistent or one field will overwrite the other.',
      ),
      'node',
      '2',
      '3',
    );
  });

  it('warns in __DEV__ if a single response contains conflicting linked fields with null values', () => {
    jest.mock('warning');
    const BarQuery = graphql`
      query RelayResponseNormalizerTest26Query($id: ID) {
        node(id: $id) {
          id
          __typename
          ... on User {
            name
            friends(first: 2) {
              edges {
                node {
                  id
                  firstName
                  comments(first: 1) {
                    edges {
                      node {
                        id
                        body {
                          text
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const payload = {
      node: {
        id: '1',
        __typename: 'User',
        name: 'Alice',
        friends: {
          edges: [
            {
              node: {
                id: 'a',
                firstName: 'Bob',
                comments: {
                  edges: [
                    {
                      node: {
                        id: '2',
                        body: {
                          text: 'Hello World',
                        },
                      },
                    },
                  ],
                },
              },
            },
            null,
            {
              node: {
                id: 'a',
                firstName: 'Bob',
                comments: {
                  edges: [
                    {
                      node: {
                        id: '3',
                        body: {
                          text: 'Hello World',
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    };
    const recordSource = new RelayRecordSourceMapImpl();
    recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
    normalize(
      recordSource,
      createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
        id: '1',
      }),
      payload,
      defaultOptions,
    );
    expect(warning).toBeCalledWith(
      false,
      expect.stringContaining(
        'RelayResponseNormalizer: Invalid record. The record contains ' +
          'references to the conflicting field, %s and its id values: %s and %s. ' +
          'We need to make sure that the record the field points ' +
          'to remains consistent or one field will overwrite the other.',
      ),
      'node',
      '2',
      '3',
    );
  });

  it('warns in __DEV__ if payload contains inconsistent types for a record', () => {
    jest.mock('warning');

    const BarQuery = graphql`
      query RelayResponseNormalizerTest27Query($id: ID) {
        node(id: $id) {
          id
          __typename
          ... on User {
            actor {
              id
              __typename
            }
            actors {
              id
              __typename
            }
          }
        }
      }
    `;

    const payload = {
      node: {
        id: '1',
        __typename: 'User',
        actor: {
          id: '1',
          __typename: 'Actor', // <- invalid
        },
        actors: [
          {
            id: '1',
            __typename: 'Actors', // <- invalid
          },
        ],
      },
    };
    const recordSource = new RelayRecordSourceMapImpl();
    recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
    expect(() => {
      normalize(
        recordSource,
        createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
          id: '1',
        }),
        payload,
        defaultOptions,
      );
      /* $FlowFixMe[incompatible-call]*/
    }).toWarn([
      'RelayResponseNormalizer: Invalid record `%s`. Expected %s to be ' +
        'consistent, but the record was assigned conflicting types `%s` ' +
        'and `%s`. The GraphQL server likely violated the globally unique ' +
        'id requirement by returning the same id for different objects.',
      '1',
      '__typename',
      'User',
      'Actor',
    ]);
    expect(() => {
      normalize(
        recordSource,
        createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
          id: '1',
        }),
        payload,
        defaultOptions,
      );
      /* $FlowFixMe[incompatible-call]*/
    }).toWarn([
      'RelayResponseNormalizer: Invalid record `%s`. Expected %s to be ' +
        'consistent, but the record was assigned conflicting types `%s` ' +
        'and `%s`. The GraphQL server likely violated the globally unique ' +
        'id requirement by returning the same id for different objects.',
      '1',
      '__typename',
      'Actor', // `User` is already overwritten when the plural field is reached
      'Actors',
    ]);
  });

  it('does not warn in __DEV__ on inconsistent types for a client record', () => {
    jest.mock('warning');

    const BarQuery = graphql`
      query RelayResponseNormalizerTest28Query($id: ID) {
        node(id: $id) {
          id
          __typename
          ... on User {
            actor {
              id
              __typename
            }
            actors {
              id
              __typename
            }
          }
        }
      }
    `;

    const payload = {
      node: {
        id: 'client:1',
        __typename: 'User',
        actor: {
          id: 'client:1',
          __typename: 'Actor', // <- invalid
        },
        actors: [
          {
            id: 'client:1',
            __typename: 'Actors', // <- invalid
          },
        ],
      },
    };
    const recordSource = new RelayRecordSourceMapImpl();
    recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
    expect(() => {
      normalize(
        recordSource,
        createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
          id: '1',
        }),
        payload,
        defaultOptions,
      );
      /* $FlowFixMe[incompatible-call]*/
    }).not.toWarn();
    expect(() => {
      normalize(
        recordSource,
        createNormalizationSelector(getRequest(BarQuery).operation, ROOT_ID, {
          id: '1',
        }),
        payload,
        defaultOptions,
      );
      /* $FlowFixMe[incompatible-call]*/
    }).not.toWarn();
  });

  it('leaves undefined fields unset', () => {
    const StrippedQuery = graphql`
      query RelayResponseNormalizerTest29Query($id: ID, $size: [Int]) {
        node(id: $id) {
          id
          __typename
          ... on User {
            firstName
            profilePicture(size: $size) {
              uri
            }
          }
        }
      }
    `;

    const payload = {
      node: {
        id: '1',
        __typename: 'User',
        firstName: 'Alice',
      },
    };
    const recordSource = new RelayRecordSourceMapImpl();
    recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
    normalize(
      recordSource,
      createNormalizationSelector(
        getRequest(StrippedQuery).operation,
        ROOT_ID,
        {
          id: '1',
          size: 32,
        },
      ),
      payload,
      defaultOptions,
    );
    expect(recordSource.toJSON()).toEqual({
      '1': {
        __id: '1',
        __typename: 'User',
        id: '1',
        firstName: 'Alice',
        // `profilePicture` is excluded
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"1")': {
          __ref: '1',
        },
      },
    });
  });

  describe('feature ENABLE_REACT_FLIGHT_COMPONENT_FIELD', () => {
    let FlightQuery;
    let recordSource;
    const dummyReactFlightPayloadDeserializer = () => {
      return {
        readRoot() {
          return {
            $$typeof: Symbol.for('react.element'),
            type: 'div',
            key: null,
            ref: null,
            props: {foo: 1},
          };
        },
      };
    };

    beforeEach(() => {
      RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = true;

      FlightQuery = graphql`
        query RelayResponseNormalizerTestFlightQuery($id: ID!, $count: Int!) {
          node(id: $id) {
            ... on Story {
              flightComponent(condition: true, count: $count, id: $id)
            }
          }
        }
      `;
      recordSource = new RelayRecordSourceMapImpl();
      recordSource.set(ROOT_ID, RelayModernRecord.create(ROOT_ID, ROOT_TYPE));
    });
    afterEach(() => {
      RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = false;
    });

    describe('when successful', () => {
      it('normalizes Flight fields', () => {
        const payload = {
          node: {
            id: '1',
            __typename: 'Story',
            flightComponent: {
              status: 'SUCCESS',
              tree: [
                {
                  type: 'div',
                  key: null,
                  ref: null,
                  props: {foo: 1},
                },
              ],
              queries: [
                {
                  id: 'b0dbe24703062b69e6b1d0c38c4f69d2',
                  module: {__dr: 'RelayFlightExampleQuery.graphql'},
                  response: {
                    data: {
                      story: {
                        id: '2',
                        name: 'Lauren',
                        __typename: 'User',
                      },
                    },
                    extensions: [],
                  },
                  variables: {
                    id: '2',
                  },
                },
              ],
              errors: [],
            },
          },
        };
        normalize(
          recordSource,
          createNormalizationSelector(
            getRequest(FlightQuery).operation,
            ROOT_ID,
            {
              count: 10,
              id: '1',
            },
          ),
          payload,
          {
            ...defaultOptions,
            reactFlightPayloadDeserializer: dummyReactFlightPayloadDeserializer,
          },
        );
        expect(recordSource.toJSON()).toMatchInlineSnapshot(`
        Object {
          "1": Object {
            "__id": "1",
            "__typename": "Story",
            "flight(component:\\"FlightComponent.server\\",props:{\\"condition\\":true,\\"count\\":10,\\"id\\":\\"1\\"})": Object {
              "__ref": "client:1:flight(component:\\"FlightComponent.server\\",props:{\\"condition\\":true,\\"count\\":10,\\"id\\":\\"1\\"})",
            },
            "id": "1",
          },
          "client:1:flight(component:\\"FlightComponent.server\\",props:{\\"condition\\":true,\\"count\\":10,\\"id\\":\\"1\\"})": Object {
            "__id": "client:1:flight(component:\\"FlightComponent.server\\",props:{\\"condition\\":true,\\"count\\":10,\\"id\\":\\"1\\"})",
            "__typename": "ReactFlightComponent",
            "queries": Array [
              Object {
                "module": Object {
                  "__dr": "RelayFlightExampleQuery.graphql",
                },
                "variables": Object {
                  "id": "2",
                },
              },
            ],
            "tree": Object {
              "readRoot": [Function],
            },
          },
          "client:root": Object {
            "__id": "client:root",
            "__typename": "__Root",
            "node(id:\\"1\\")": Object {
              "__ref": "1",
            },
          },
        }
      `);
      });

      it('asserts that reactFlightPayloadDeserializer is defined as a function', () => {
        const payload = {
          node: {
            id: '1',
            __typename: 'Story',
            flightComponent: {
              status: 'SUCCESS',
              tree: [],
              queries: [],
              errors: [],
            },
          },
        };

        expect(() => {
          normalize(
            recordSource,
            createNormalizationSelector(
              getRequest(FlightQuery).operation,
              ROOT_ID,
              {
                count: 10,
                id: '1',
              },
            ),
            payload,
            {
              ...defaultOptions,
              reactFlightPayloadDeserializer: dummyReactFlightPayloadDeserializer,
            },
          );
        }).not.toThrow();
        expect(() => {
          normalize(
            recordSource,
            createNormalizationSelector(
              getRequest(FlightQuery).operation,
              ROOT_ID,
              {
                count: 10,
                id: '1',
              },
            ),
            payload,
            defaultOptions,
          );
        }).toThrow();
      });
    });

    describe('when server errors are encountered', () => {
      describe('and ReactFlightServerErrorHandler is specified', () => {
        const reactFlightServerErrorHandler = jest.fn();
        it('calls ReactFlightServerErrorHandler', () => {
          const payload = {
            node: {
              id: '1',
              __typename: 'Story',
              flightComponent: {
                status: 'FAIL_JS_ERROR',
                tree: [],
                queries: [],
                errors: [
                  {
                    message: 'Something threw an error on the server',
                    stack: 'Error\n    at <anonymous>:1:1',
                  },
                ],
              },
            },
          };
          normalize(
            recordSource,
            createNormalizationSelector(
              getRequest(FlightQuery).operation,
              ROOT_ID,
              {
                count: 10,
                id: '1',
              },
            ),
            payload,
            {
              ...defaultOptions,
              reactFlightPayloadDeserializer: dummyReactFlightPayloadDeserializer,
              reactFlightServerErrorHandler,
            },
          );
          expect(reactFlightServerErrorHandler).toHaveBeenCalledWith(
            'FAIL_JS_ERROR',
            expect.arrayContaining([
              expect.objectContaining({
                message: 'Something threw an error on the server',
                stack: 'Error\n    at <anonymous>:1:1',
              }),
            ]),
          );
        });
      });
      describe('and no ReactFlightServerErrorHandler is specified', () => {
        beforeEach(() => {
          jest.mock('warning');
        });

        it('warns', () => {
          const payload = {
            node: {
              id: '1',
              __typename: 'Story',
              flightComponent: {
                status: 'FAIL_JS_ERROR',
                tree: [],
                queries: [],
                errors: [
                  {
                    message: 'Something threw an error on the server',
                    stack: 'Error\n    at <anonymous>:1:1',
                  },
                ],
              },
            },
          };

          normalize(
            recordSource,
            createNormalizationSelector(
              getRequest(FlightQuery).operation,
              ROOT_ID,
              {
                count: 10,
                id: '1',
              },
            ),
            payload,
            {
              ...defaultOptions,
              reactFlightPayloadDeserializer: dummyReactFlightPayloadDeserializer,
            },
          );
          expect(warning).toHaveBeenCalledWith(
            false,
            expect.stringContaining(
              'RelayResponseNormalizer: Received server errors for field `%s`.',
            ),
            'flightComponent',
            expect.stringContaining('Something threw an error on the server'),
            expect.stringContaining('Error\n    at <anonymous>:1:1'),
          );
        });
      });
    });

    describe('when the row protocol is malformed', () => {
      beforeEach(() => {
        jest.mock('warning');
      });

      it('warns if the row protocol is null', () => {
        const payload = {
          node: {
            id: '1',
            __typename: 'Story',
            flightComponent: {
              status: 'UNEXPECTED_ERROR',
              tree: null,
              queries: [],
              errors: [],
            },
          },
        };

        normalize(
          recordSource,
          createNormalizationSelector(
            getRequest(FlightQuery).operation,
            ROOT_ID,
            {
              count: 10,
              id: '1',
            },
          ),
          payload,
          {
            ...defaultOptions,
            reactFlightPayloadDeserializer: dummyReactFlightPayloadDeserializer,
          },
        );

        expect(warning).toHaveBeenCalledWith(
          false,
          expect.stringContaining(
            'RelayResponseNormalizer: Expected `tree` not to be null.',
          ),
        );
      });
    });
  });
});
