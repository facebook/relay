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

const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernRecord = require('../RelayModernRecord');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');

const defaultGetDataID = require('../defaultGetDataID');
const getRelayHandleKey = require('../../util/getRelayHandleKey');

const {check} = require('../DataChecker');
const {createNormalizationSelector} = require('../RelayModernSelector');
const {ROOT_ID} = require('../RelayStoreUtils');
const {generateTypeID, TYPE_SCHEMA_TYPE} = require('../TypeID');
const {
  createMockEnvironment,
  generateAndCompile,
} = require('relay-test-utils-internal');

describe('check()', () => {
  let Query;
  let sampleData;
  beforeEach(() => {
    sampleData = {
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
    ({Query} = generateAndCompile(`
      query Query($id: ID, $size: [Int]) {
        node(id: $id) {
          id
          __typename
          ... on Page {
            actors {
              name
            }
          }
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
    `));
  });

  it('reads query data', () => {
    const source = RelayRecordSource.create(sampleData);
    const target = RelayRecordSource.create();
    const status = check(
      source,
      target,
      createNormalizationSelector(Query.fragment, ROOT_ID, {id: '1', size: 32}),
      [],
      null,
      defaultGetDataID,
    );
    expect(status).toEqual({
      status: 'available',
      mostRecentlyInvalidatedAt: null,
    });
    expect(target.size()).toBe(0);
  });

  it('reads fragment data', () => {
    const data = {
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        firstName: 'Alice',
        'friends(first:1)': {__ref: 'client:1'},
        'profilePicture(size:32)': {__ref: 'client:3'},
      },
      '2': {
        __id: '2',
        __typename: 'User',
        id: '2',
        firstName: 'Bob',
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
      'client:3': {
        __id: 'client:3',
        __typename: 'Photo',
        uri: 'https://...',
      },
    };
    const source = RelayRecordSource.create(data);
    const target = RelayRecordSource.create();
    const {BarFragment} = generateAndCompile(`
      fragment BarFragment on User @argumentDefinitions(
        size: {type: "[Int]"}
      ) {
        id
        firstName
        friends(first: 1) {
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
    `);
    const status = check(
      source,
      target,
      createNormalizationSelector(BarFragment, '1', {size: 32}),
      [],
      null,
      defaultGetDataID,
    );
    expect(status).toEqual({
      status: 'available',
      mostRecentlyInvalidatedAt: null,
    });
    expect(target.size()).toBe(0);
  });

  it('reads handle fields in fragment', () => {
    const handleKey = getRelayHandleKey('test', null, 'profilePicture');
    const data = {
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        'profilePicture(size:32)': {__ref: 'client:1'},
        [handleKey]: {__ref: 'client:3'},
      },
      'client:1': {
        __id: 'client:2',
        __typename: 'Photo',
        uri: 'https://...',
      },
      'client:3': {
        __id: 'client:2',
        __typename: 'Photo',
        uri: 'https://...',
      },
    };
    const source = RelayRecordSource.create(data);
    const target = RelayRecordSource.create();
    const {Fragment} = generateAndCompile(`
      fragment Fragment on User {
        profilePicture(size: 32) @__clientField(handle: "test") {
          uri
        }
      }
    `);
    const status = check(
      source,
      target,
      createNormalizationSelector(Fragment, '1', {}),
      [],
      null,
      defaultGetDataID,
    );
    expect(status).toEqual({
      status: 'available',
      mostRecentlyInvalidatedAt: null,
    });
    expect(target.size()).toBe(0);
  });

  it('reads handle fields in fragment and checks missing', () => {
    const data = {
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        'profilePicture(size:32)': {__ref: 'client:1'},
        // missing [handleKey] field
      },
      'client:1': {
        __id: 'client:2',
        __typename: 'Photo',
        uri: 'https://...',
      },
      'client:3': {
        __id: 'client:2',
        __typename: 'Photo',
        uri: 'https://...',
      },
    };
    const source = RelayRecordSource.create(data);
    const target = RelayRecordSource.create();
    const {Fragment} = generateAndCompile(`
      fragment Fragment on User {
        profilePicture(size: 32) @__clientField(handle: "test") {
          uri
        }
      }
    `);
    const status = check(
      source,
      target,
      createNormalizationSelector(Fragment, '1', {}),
      [],
      null,
      defaultGetDataID,
    );
    expect(status).toEqual({
      status: 'missing',
      mostRecentlyInvalidatedAt: null,
    });
    expect(target.size()).toBe(0);
  });

  it('reads handle fields in fragment and checks missing sub field', () => {
    const handleKey = getRelayHandleKey('test', null, 'profilePicture');
    const data = {
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        'profilePicture(size:32)': {__ref: 'client:1'},
        [handleKey]: {__ref: 'client:3'},
      },
      'client:1': {
        __id: 'client:2',
        __typename: 'Photo',
        uri: 'https://...',
      },
      'client:3': {
        __id: 'client:2',
        __typename: 'Photo',
        // uri field is missing
      },
    };
    const source = RelayRecordSource.create(data);
    const target = RelayRecordSource.create();
    const {Fragment} = generateAndCompile(`
      fragment Fragment on User {
        profilePicture(size: 32) @__clientField(handle: "test") {
          uri
        }
      }
    `);

    const status = check(
      source,
      target,
      createNormalizationSelector(Fragment, '1', {}),
      [],
      null,
      defaultGetDataID,
    );
    expect(status).toEqual({
      status: 'missing',
      mostRecentlyInvalidatedAt: null,
    });
    expect(target.size()).toBe(0);
  });

  it('reads handle fields in operation', () => {
    const handleKey = getRelayHandleKey('test', null, 'profilePicture');
    const data = {
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        'profilePicture(size:32)': {__ref: 'client:1'},
        [handleKey]: {__ref: 'client:3'},
      },
      'client:1': {
        __id: 'client:2',
        __typename: 'Photo',
        uri: 'https://...',
      },
      'client:3': {
        __id: 'client:2',
        __typename: 'Photo',
        uri: 'https://...',
      },
    };
    const source = RelayRecordSource.create(data);
    const target = RelayRecordSource.create();
    // LinkedHandle selectors are only generated for a the normalization
    // code for a query
    const {Query: ProfilePictureQuery} = generateAndCompile(`
      query Query {
        me {
          profilePicture(size: 32) @__clientField(handle: "test") {
            uri
          }
        }
      }
    `);

    const status = check(
      source,
      target,
      createNormalizationSelector(
        ProfilePictureQuery.operation,
        'client:root',
        {},
      ),
      [],
      null,
      defaultGetDataID,
    );
    expect(status).toEqual({
      status: 'available',
      mostRecentlyInvalidatedAt: null,
    });
    expect(target.size()).toBe(0);
  });

  it('reads handle fields in operation and checks missing', () => {
    const data = {
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        'profilePicture(size:32)': {__ref: 'client:1'},
        // missing [handleKey] field
      },
      'client:1': {
        __id: 'client:2',
        __typename: 'Photo',
        uri: 'https://...',
      },
      'client:3': {
        __id: 'client:2',
        __typename: 'Photo',
        uri: 'https://...',
      },
    };
    const source = RelayRecordSource.create(data);
    const target = RelayRecordSource.create();
    // LinkedHandle selectors are only generated for a the normalization
    // code for a query
    const {Query: ProfilePictureQuery} = generateAndCompile(`
      query Query {
        me {
          profilePicture(size: 32) @__clientField(handle: "test") {
            uri
          }
        }
      }
    `);

    const status = check(
      source,
      target,
      createNormalizationSelector(
        ProfilePictureQuery.operation,
        'client:root',
        {},
      ),
      [],
      null,
      defaultGetDataID,
    );
    expect(status).toEqual({
      status: 'missing',
      mostRecentlyInvalidatedAt: null,
    });
    expect(target.size()).toBe(0);
  });

  it('reads handle fields in operation and checks missing sub field', () => {
    const handleKey = getRelayHandleKey('test', null, 'profilePicture');
    const data = {
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        'profilePicture(size:32)': {__ref: 'client:1'},
        [handleKey]: {__ref: 'client:3'},
      },
      'client:1': {
        __id: 'client:2',
        __typename: 'Photo',
        uri: 'https://...',
      },
      'client:3': {
        __id: 'client:2',
        __typename: 'Photo',
        // uri field is missing
      },
    };
    const source = RelayRecordSource.create(data);
    const target = RelayRecordSource.create();
    // LinkedHandle selectors are only generated for a the normalization
    // code for a query
    const {Query: ProfilePictureQuery} = generateAndCompile(`
      query Query {
        me {
          profilePicture(size: 32) @__clientField(handle: "test") {
            uri
          }
        }
      }
    `);

    const status = check(
      source,
      target,
      createNormalizationSelector(
        ProfilePictureQuery.operation,
        'client:root',
        {},
      ),
      [],
      null,
      defaultGetDataID,
    );
    expect(status).toEqual({
      status: 'missing',
      mostRecentlyInvalidatedAt: null,
    });
    expect(target.size()).toBe(0);
  });

  it('reads scalar handle fields in operation and checks presence', () => {
    const handleKey = getRelayHandleKey('test', null, 'uri');
    const data = {
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        'profilePicture(size:32)': {__ref: 'client:1'},
      },
      'client:1': {
        __id: 'client:2',
        __typename: 'Photo',
        uri: 'https://...',
        [handleKey]: 'https://...',
      },
    };
    const source = RelayRecordSource.create(data);
    const target = RelayRecordSource.create();
    // ScalarHandle selectors are only generated for a the normalization
    // code for a query
    const {Query: ProfilePictureQuery} = generateAndCompile(`
      query Query {
        me {
          profilePicture(size: 32) {
            uri @__clientField(handle: "test")
          }
        }
      }
    `);

    const status = check(
      source,
      target,
      createNormalizationSelector(
        ProfilePictureQuery.operation,
        'client:root',
        {},
      ),
      [],
      null,
      defaultGetDataID,
    );
    expect(status).toEqual({
      status: 'available',
      mostRecentlyInvalidatedAt: null,
    });
    expect(target.size()).toBe(0);
  });

  it('reads scalar handle fields in operation and checks missing', () => {
    const data = {
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        'profilePicture(size:32)': {__ref: 'client:1'},
      },
      'client:1': {
        __id: 'client:2',
        __typename: 'Photo',
        uri: 'https://...',
        // [handleKey] field is missing
      },
    };
    const source = RelayRecordSource.create(data);
    const target = RelayRecordSource.create();
    // ScalarHandle selectors are only generated for a the normalization
    // code for a query
    const {Query: ProfilePictureQuery} = generateAndCompile(`
      query Query {
        me {
          profilePicture(size: 32) {
            uri @__clientField(handle: "test")
          }
        }
      }
    `);
    const status = check(
      source,
      target,
      createNormalizationSelector(
        ProfilePictureQuery.operation,
        'client:root',
        {},
      ),
      [],
      null,
      defaultGetDataID,
    );
    expect(status).toEqual({
      status: 'missing',
      mostRecentlyInvalidatedAt: null,
    });
    expect(target.size()).toBe(0);
  });

  describe('when @match directive is present', () => {
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

    it('returns true when the match field/record exist and match a supported type (plaintext)', () => {
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
          __module_component_BarFragment: 'PlainUserNameRenderer.react',
          __module_operation_BarFragment:
            'PlainUserNameRenderer_name$normalization.graphql',
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
          id: 'data',
          text: 'text',
        },
      };
      const source = RelayRecordSource.create(storeData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        [],
        loader,
        defaultGetDataID,
      );
      expect(loader.get).toBeCalledTimes(1);
      expect(loader.get.mock.calls[0][0]).toBe(
        'PlainUserNameRenderer_name$normalization.graphql',
      );
      expect(status).toEqual({
        status: 'available',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns true when the match field/record exist and match a supported type (markdown)', () => {
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
          __module_component_BarFragment: 'MarkdownUserNameRenderer.react',
          __module_operation_BarFragment:
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
          id: 'data',
          markup: '<markup/>',
        },
      };
      const source = RelayRecordSource.create(storeData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        [],
        loader,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'available',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns false when the match field/record exist but the matched fragment has not been processed', () => {
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
      const source = RelayRecordSource.create(storeData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        [],
        // Return null to indicate the fragment is not loaded yet
        {
          get: _ => null,
          load: _ => Promise.resolve(null),
        },
        defaultGetDataID,
      );
      // The data for the field isn't in the store yet, so we have to return false
      expect(status).toEqual({
        status: 'missing',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns false when the match field/record exist but a scalar field is missing', () => {
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
          id: 'data',
          markup: '<markup/>',
        },
      };
      const source = RelayRecordSource.create(storeData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        [],
        loader,
        defaultGetDataID,
      );
      // The data for the field 'data' isn't in the store yet, so we have to return false
      expect(status).toEqual({
        status: 'missing',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns false when the match field/record exist but a linked field is missing', () => {
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
      const source = RelayRecordSource.create(storeData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        [],
        loader,
        defaultGetDataID,
      );
      // The data for the field 'data' isn't in the store yet, so we have to return false
      expect(status).toEqual({
        status: 'missing',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns true when the match field/record exist but do not match a supported type', () => {
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
      const source = RelayRecordSource.create(storeData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        [],
        loader,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'available',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns true when the match field is non-existent (null)', () => {
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
      const source = RelayRecordSource.create(storeData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        [],
        loader,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'available',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns false when the match field is not fetched (undefined)', () => {
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
      const source = RelayRecordSource.create(storeData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        [],
        loader,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'missing',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });
  });

  describe('when @module directive is present', () => {
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
          nameRenderer { # no @match
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

    it('returns true when the field/record exists and matches the @module type (plaintext)', () => {
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
          __module_component_BarFragment: 'PlainUserNameRenderer.react',
          __module_operation_BarFragment:
            'PlainUserNameRenderer_name$normalization.graphql',
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
          id: 'data',
          text: 'text',
        },
      };
      const source = RelayRecordSource.create(storeData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        [],
        loader,
        defaultGetDataID,
      );
      expect(loader.get).toBeCalledTimes(1);
      expect(loader.get.mock.calls[0][0]).toBe(
        'PlainUserNameRenderer_name$normalization.graphql',
      );
      expect(status).toEqual({
        status: 'available',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns true when the field/record exist and matches the @module type (markdown)', () => {
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
          __module_component_BarFragment: 'MarkdownUserNameRenderer.react',
          __module_operation_BarFragment:
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
          id: 'data',
          markup: '<markup/>',
        },
      };
      const source = RelayRecordSource.create(storeData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        [],
        loader,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'available',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns false when the field/record exist but the @module fragment has not been processed', () => {
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
      const source = RelayRecordSource.create(storeData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        [],
        // Return null to indicate the fragment is not loaded yet
        {
          get: _ => null,
          load: _ => Promise.resolve(null),
        },
        defaultGetDataID,
      );
      // The data for the field isn't in the store yet, so we have to return false
      expect(status).toEqual({
        status: 'missing',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns false when the field/record exists but a scalar field is missing', () => {
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
          id: 'data',
          markup: '<markup/>',
        },
      };
      const source = RelayRecordSource.create(storeData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        [],
        loader,
        defaultGetDataID,
      );
      // The data for the field 'data' isn't in the store yet, so we have to return false
      expect(status).toEqual({
        status: 'missing',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns false when the field/record exists but a linked field is missing', () => {
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
      const source = RelayRecordSource.create(storeData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        [],
        loader,
        defaultGetDataID,
      );
      // The data for the field 'data' isn't in the store yet, so we have to return false
      expect(status).toEqual({
        status: 'missing',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns true when the field/record exists but does not match any @module selection', () => {
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
      const source = RelayRecordSource.create(storeData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(BarQuery.operation, 'client:root', {
          id: '1',
        }),
        [],
        loader,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'available',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });
  });

  describe('when @defer directive is present', () => {
    beforeEach(() => {
      const nodes = generateAndCompile(`
        fragment TestFragment on User {
          id
          name
        }

        query TestQuery($id: ID!) {
          node(id: $id) {
            ...TestFragment @defer(label: "TestFragment")
          }
        }
      `);
      Query = nodes.TestQuery;
    });

    it('returns true when deferred selections are fetched', () => {
      const storeData = {
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
      };
      const source = RelayRecordSource.create(storeData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(Query.operation, 'client:root', {id: '1'}),
        [],
        null,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'available',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns false when deferred selections are not fetched', () => {
      const storeData = {
        '1': {
          __id: '1',
          __typename: 'User',
          id: '1',
          // 'name' not fetched
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      const source = RelayRecordSource.create(storeData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(Query.operation, 'client:root', {id: '1'}),
        [],
        null,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'missing',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });
  });

  describe('when @stream directive is present', () => {
    beforeEach(() => {
      const nodes = generateAndCompile(`
        fragment TestFragment on Feedback {
          id
          actors @stream(label: "TestFragmentActors", initial_count: 0) {
            name
          }
        }

        query TestQuery($id: ID!) {
          node(id: $id) {
            ...TestFragment
          }
        }
      `);
      Query = nodes.TestQuery;
    });

    it('returns true when streamed selections are fetched', () => {
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
      const source = RelayRecordSource.create(storeData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(Query.operation, 'client:root', {id: '1'}),
        [],
        null,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'available',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns false when streamed selections are not fetched', () => {
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
          // name not fetched
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      const source = RelayRecordSource.create(storeData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(Query.operation, 'client:root', {id: '1'}),
        [],
        null,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'missing',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });
  });

  describe('when the data is complete', () => {
    it('returns available', () => {
      const source = RelayRecordSource.create(sampleData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(Query.fragment, ROOT_ID, {
          id: '1',
          size: 32,
        }),
        [],
        null,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'available',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });
  });

  describe('when some data is missing', () => {
    it('returns missing on missing records', () => {
      const data = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          firstName: 'Alice',
          'profilePicture(size:32)': {__ref: 'client:3'},
        },
        // missing profilePicture record
      };
      const source = RelayRecordSource.create(data);
      const target = RelayRecordSource.create();
      const {BarFragment} = generateAndCompile(`
        fragment BarFragment on User @argumentDefinitions(
          size: {type: "[Int]"}
        ) {
          id
          firstName
          profilePicture(size: $size) {
            uri
          }
        }
      `);
      const status = check(
        source,
        target,
        createNormalizationSelector(BarFragment, '1', {size: 32}),
        [],
        null,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'missing',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns missing on missing fields', () => {
      const data = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          firstName: 'Alice',
          'profilePicture(size:32)': {__ref: 'client:3'},
        },
        'client:3': {
          __id: 'client:3',
          // missing 'uri'
        },
      };
      const source = RelayRecordSource.create(data);
      const target = RelayRecordSource.create();
      const {BarFragment} = generateAndCompile(`
        fragment BarFragment on User @argumentDefinitions(
          size: {type: "[Int]"}
        ) {
          id
          firstName
          profilePicture(size: $size) {
            uri
          }
        }
      `);
      const status = check(
        source,
        target,
        createNormalizationSelector(BarFragment, '1', {size: 32}),
        [],
        null,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'missing',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('allows handlers to supplement missing scalar fields', () => {
      const data = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          firstName: 'Alice',
          'profilePicture(size:32)': {__ref: 'client:3'},
        },
        'client:3': {
          __id: 'client:3',
          __typename: 'Image',
          // missing 'uri'
        },
      };
      const source = RelayRecordSource.create(data);
      const target = RelayRecordSource.create();
      const {BarFragment} = generateAndCompile(`
        fragment BarFragment on User @argumentDefinitions(
          size: {type: "[Int]"}
        ) {
          id
          firstName
          profilePicture(size: $size) {
            uri
          }
        }
      `);
      const status = check(
        source,
        target,
        createNormalizationSelector(BarFragment, '1', {size: 32}),
        [
          {
            kind: 'scalar',
            handle: (field, record, argValues) => {
              return 'thebestimage.uri';
            },
          },
        ],
        null,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'available',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.toJSON()).toEqual({
        'client:3': {
          __id: 'client:3',
          __typename: 'Image',
          uri: 'thebestimage.uri',
        },
      });
    });

    test.each([
      [
        'undefined',
        {
          handleReturnValue: undefined,
          expectedStatus: {status: 'missing', mostRecentlyInvalidatedAt: null},
          updatedHometown: undefined,
        },
      ],
      [
        'null',
        {
          handleReturnValue: null,
          expectedStatus: {
            status: 'available',
            mostRecentlyInvalidatedAt: null,
          },
          updatedHometown: null,
        },
      ],
      [
        "'hometown-exists'",
        {
          handleReturnValue: 'hometown-exists',
          expectedStatus: {
            status: 'available',
            mostRecentlyInvalidatedAt: null,
          },
          updatedHometown: 'hometown-exists',
        },
      ],
      [
        "'hometown-deleted'",
        {
          handleReturnValue: 'hometown-deleted',
          expectedStatus: {status: 'missing', mostRecentlyInvalidatedAt: null},
          updatedHometown: undefined,
        },
      ],
      [
        "'hometown-unknown'",
        {
          handleReturnValue: 'hometown-unknown',
          expectedStatus: {status: 'missing', mostRecentlyInvalidatedAt: null},
          updatedHometown: undefined,
        },
      ],
    ])(
      'linked field handler handler that returns %s',
      (_name, {handleReturnValue, expectedStatus, updatedHometown}) => {
        const data = {
          user1: {
            __id: 'user1',
            id: 'user1',
            __typename: 'User',
            firstName: 'Alice',
            // hometown: missing
          },
          'hometown-exists': {
            __id: 'hometown',
            __typename: 'Page',
            name: 'New York City',
          },
          'hometown-deleted': null,
        };
        const source = RelayRecordSource.create(data);
        const target = RelayRecordSource.create();
        const {UserFragment} = generateAndCompile(`
          fragment UserFragment on User {
            hometown {
              name
            }
          }
        `);
        const handle = jest.fn((field, record, argValues) => {
          return handleReturnValue;
        });
        const status = check(
          source,
          target,
          createNormalizationSelector(UserFragment, 'user1', {}),
          [
            {
              kind: 'linked',
              handle,
            },
          ],
          null,
          defaultGetDataID,
        );
        expect(handle).toBeCalledTimes(1);
        expect(status).toEqual(expectedStatus);
        expect(target.toJSON()).toEqual(
          updatedHometown === undefined
            ? {}
            : updatedHometown === null
            ? {
                user1: {
                  __id: 'user1',
                  __typename: 'User',
                  hometown: null,
                },
              }
            : {
                user1: {
                  __id: 'user1',
                  __typename: 'User',
                  hometown: {
                    __ref: updatedHometown,
                  },
                },
              },
        );
      },
    );

    test.each([
      [
        'undefined',
        {
          handleReturnValue: undefined,
          expectedStatus: {status: 'missing', mostRecentlyInvalidatedAt: null},
          updatedScreennames: undefined,
        },
      ],
      [
        'null',
        {
          handleReturnValue: null,
          expectedStatus: {
            status: 'available',
            mostRecentlyInvalidatedAt: null,
          },
          updatedScreennames: null,
        },
      ],
      [
        '[]',
        {
          handleReturnValue: [],
          expectedStatus: {
            status: 'available',
            mostRecentlyInvalidatedAt: null,
          },
          updatedScreennames: [],
        },
      ],
      [
        '[undefined]',
        {
          handleReturnValue: [undefined],
          expectedStatus: {status: 'missing', mostRecentlyInvalidatedAt: null},
          updatedScreennames: undefined,
        },
      ],
      [
        '[null]',
        {
          handleReturnValue: [null],
          expectedStatus: {status: 'missing', mostRecentlyInvalidatedAt: null},
          updatedScreennames: undefined,
        },
      ],
      [
        "['screenname-exists']",
        {
          handleReturnValue: ['screenname-exists'],
          expectedStatus: {
            status: 'available',
            mostRecentlyInvalidatedAt: null,
          },
          updatedScreennames: ['screenname-exists'],
        },
      ],
      [
        "['screenname-deleted']",
        {
          handleReturnValue: ['screenname-deleted'],
          expectedStatus: {status: 'missing', mostRecentlyInvalidatedAt: null},
          updatedScreennames: undefined,
        },
      ],
      [
        "['screenname-unknown']",
        {
          handleReturnValue: ['screenname-unknown'],
          expectedStatus: {status: 'missing', mostRecentlyInvalidatedAt: null},
          updatedScreennames: undefined,
        },
      ],
      [
        "['screenname-exists', 'screenname-unknown']",
        {
          handleReturnValue: ['screenname-exists', 'screenname-unknown'],
          expectedStatus: {status: 'missing', mostRecentlyInvalidatedAt: null},
          updatedScreennames: undefined,
        },
      ],
    ])(
      'plural linked field handler handler that returns %s',
      (_name, {handleReturnValue, expectedStatus, updatedScreennames}) => {
        const data = {
          user1: {
            __id: 'user1',
            id: 'user1',
            __typename: 'User',
            firstName: 'Alice',
            // screennames: missing
          },
          'screenname-exists': {
            __id: 'screenname-exists',
            __typename: 'Screenname',
            name: 'Bert',
          },
          'screenname-deleted': null,
        };
        const source = RelayRecordSource.create(data);
        const target = RelayRecordSource.create();
        const {UserFragment} = generateAndCompile(`
          fragment UserFragment on User {
            screennames {
              name
            }
          }
        `);
        const handle = jest.fn((field, record, argValues) => {
          return handleReturnValue;
        });
        const status = check(
          source,
          target,
          createNormalizationSelector(UserFragment, 'user1', {}),
          [
            {
              kind: 'pluralLinked',
              handle,
            },
          ],
          null,
          defaultGetDataID,
        );
        expect(handle).toBeCalledTimes(1);
        expect(status).toEqual(expectedStatus);
        expect(target.toJSON()).toEqual(
          updatedScreennames === undefined
            ? {}
            : updatedScreennames === null
            ? {
                user1: {
                  __id: 'user1',
                  __typename: 'User',
                  screennames: null,
                },
              }
            : {
                user1: {
                  __id: 'user1',
                  __typename: 'User',
                  screennames: {
                    __refs: updatedScreennames,
                  },
                },
              },
        );
      },
    );

    it('returns modified records with the target', () => {
      const data = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
        },
        profile_1_32: {
          __id: 'profile_1_32',
          id: 'profile_1_32',
          __typename: 'Profile',
          uri: 'thebestimage.uri',
        },
      };
      const source = RelayRecordSource.create(data);
      const target = RelayRecordSource.create();
      const {BarFragment} = generateAndCompile(`
        fragment BarFragment on User @argumentDefinitions(
          size: {type: "[Int]"}
        ) {
          id
          firstName
          profilePicture(size: $size) {
            uri
          }
        }
      `);
      const status = check(
        source,
        target,
        createNormalizationSelector(BarFragment, '1', {size: 32}),
        [
          {
            kind: 'scalar',
            handle: (field, record, argValues) => {
              if (
                record &&
                RelayModernRecord.getDataID(record) === '1' &&
                field.name === 'firstName'
              ) {
                return 'Alice';
              }
            },
          },
          {
            kind: 'linked',
            handle: (field, record, argValues) => {
              const id = record && RelayModernRecord.getDataID(record);
              if (
                field.name === 'profilePicture' &&
                record &&
                typeof id === 'string'
              ) {
                return `profile_${id}_${argValues.size}`;
              }
            },
          },
        ],
        null,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'available',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.toJSON()).toEqual({
        '1': {
          __id: '1',
          __typename: 'User',
          firstName: 'Alice',
          'profilePicture(size:32)': {__ref: 'profile_1_32'},
        },
      });
    });

    it('returns available even when client field is missing', () => {
      const data = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          firstName: 'Alice',
          'profilePicture(size:32)': {__ref: 'client:3'},
        },
      };
      const source = RelayRecordSource.create(data);
      const target = RelayRecordSource.create();
      const {BarFragment} = generateAndCompile(`
        fragment BarFragment on User @argumentDefinitions(
          size: {type: "[Int]"}
        ) {
          id
          firstName
          client_actor_field
          client_foo {
            client_name
            profile_picture(scale: 2) {
              uri
            }
          }
          best_friends {
            edges {
              client_friend_edge_field
              cursor
              node {
                id
                client_foo {
                  client_name
                  profile_picture(scale: 2) {
                    uri
                  }
                }
                ... on Actor {
                  client_actor_field
                  profilePicture(size: $size) {
                    uri
                    height
                    width
                  }
                }
              }
            }
          }
        }
        extend type FriendsEdge {
          client_friend_edge_field: String
        }
        extend type User {
          nickname: String
          best_friends: FriendsConnection
          client_actor_field: String
          client_foo: Foo
        }
        extend type FriendsConnection {
          client_friends_connection_field: String
        }
        extend type Page {
          client_actor_field: String
        }
        extend interface Actor {
          client_actor_field: String
        }
        type Foo {
          client_name: String
          profile_picture(scale: Float): Image
        }
      `);
      const status = check(
        source,
        target,
        createNormalizationSelector(BarFragment, '1', {size: 32}),
        [],
        null,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'available',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });
  });

  describe('when individual records have been invalidated', () => {
    describe('when data is complete', () => {
      it('returns correct invalidation epoch in result when record was invalidated', () => {
        const source = RelayRecordSource.create(sampleData);
        const target = RelayRecordSource.create();
        const environment = createMockEnvironment({
          store: new RelayModernStore(source),
        });

        // Invalidate record
        environment.commitUpdate(storeProxy => {
          const user = storeProxy.get('1');
          if (!user) {
            throw new Error('Expected to find record with id "1"');
          }
          user.invalidateRecord();
        });

        const status = check(
          source,
          target,
          createNormalizationSelector(Query.fragment, ROOT_ID, {
            id: '1',
            size: 32,
          }),
          [],
          null,
          defaultGetDataID,
        );

        // Assert mostRecentlyInvalidatedAt matches most recent invalidation epoch
        expect(status).toEqual({
          status: 'available',
          mostRecentlyInvalidatedAt: 1,
        });
        expect(target.size()).toBe(0);
      });

      it('returns correct invalidation epoch in result when multiple records invalidated at different times', () => {
        const source = RelayRecordSource.create(sampleData);
        const target = RelayRecordSource.create();
        const environment = createMockEnvironment({
          store: new RelayModernStore(source),
        });

        // Invalidate record
        environment.commitUpdate(storeProxy => {
          const user = storeProxy.get('1');
          if (!user) {
            throw new Error('Expected to find record with id "1"');
          }
          user.invalidateRecord();
        });

        const status = check(
          source,
          target,
          createNormalizationSelector(Query.fragment, ROOT_ID, {
            id: '1',
            size: 32,
          }),
          [],
          null,
          defaultGetDataID,
        );

        // Assert mostRecentlyInvalidatedAt matches most recent invalidation epoch
        expect(status).toEqual({
          status: 'available',
          mostRecentlyInvalidatedAt: 1,
        });
        expect(target.size()).toBe(0);

        // Invalidate other record in operation
        environment.commitUpdate(storeProxy => {
          const photo = storeProxy.get('client:4');
          if (!photo) {
            throw new Error('Expected to find record with id "client:4"');
          }
          photo.invalidateRecord();
        });

        const nextStatus = check(
          source,
          target,
          createNormalizationSelector(Query.fragment, ROOT_ID, {
            id: '1',
            size: 32,
          }),
          [],
          null,
          defaultGetDataID,
        );

        // Assert mostRecentlyInvalidatedAt matches most recent invalidation epoch
        expect(nextStatus).toEqual({
          status: 'available',
          mostRecentlyInvalidatedAt: 2,
        });
        expect(target.size()).toBe(0);
      });
    });

    describe('when data is missing', () => {
      beforeEach(() => {
        sampleData = {
          ...sampleData,
          'client:4': {
            __id: 'client:4',
            __typename: 'Photo',
            // missing 'uri'
          },
        };
      });

      it('returns correct invalidation epoch in result when record was invalidated', () => {
        const source = RelayRecordSource.create(sampleData);
        const target = RelayRecordSource.create();
        const environment = createMockEnvironment({
          store: new RelayModernStore(source),
        });

        // Invalidate record
        environment.commitUpdate(storeProxy => {
          const user = storeProxy.get('1');
          if (!user) {
            throw new Error('Expected to find record with id "1"');
          }
          user.invalidateRecord();
        });

        const status = check(
          source,
          target,
          createNormalizationSelector(Query.fragment, ROOT_ID, {
            id: '1',
            size: 32,
          }),
          [],
          null,
          defaultGetDataID,
        );

        // Assert result is missing
        expect(status).toEqual({
          status: 'missing',
          mostRecentlyInvalidatedAt: 1,
        });
        expect(target.size()).toBe(0);
      });

      it('returns correct invalidation epoch in result when multiple records invalidated at different times', () => {
        const source = RelayRecordSource.create(sampleData);
        const target = RelayRecordSource.create();
        const environment = createMockEnvironment({
          store: new RelayModernStore(source),
        });

        // Invalidate record
        environment.commitUpdate(storeProxy => {
          const user = storeProxy.get('1');
          if (!user) {
            throw new Error('Expected to find record with id "1"');
          }
          user.invalidateRecord();
        });

        const status = check(
          source,
          target,
          createNormalizationSelector(Query.fragment, ROOT_ID, {
            id: '1',
            size: 32,
          }),
          [],
          null,
          defaultGetDataID,
        );

        // Assert that result is missing
        expect(status).toEqual({
          status: 'missing',
          mostRecentlyInvalidatedAt: 1,
        });
        expect(target.size()).toBe(0);

        // Invalidate other record in operation
        environment.commitUpdate(storeProxy => {
          const photo = storeProxy.get('client:4');
          if (!photo) {
            throw new Error('Expected to find record with id "client:4"');
          }
          photo.invalidateRecord();
        });

        const nextStatus = check(
          source,
          target,
          createNormalizationSelector(Query.fragment, ROOT_ID, {
            id: '1',
            size: 32,
          }),
          [],
          null,
          defaultGetDataID,
        );

        // Assert that result is still missing
        expect(nextStatus).toEqual({
          status: 'missing',
          mostRecentlyInvalidatedAt: 2,
        });
        expect(target.size()).toBe(0);
      });

      it('returns null invalidation epoch when stale record is unreachable', () => {
        sampleData = {
          // Root record is missing, so none of the descendants are reachable
          '1': {
            __id: '1',
            id: '1',
            __typename: 'User',
            firstName: 'Alice',
            'friends(first:3)': {__ref: 'client:1'},
            'profilePicture(size:32)': {__ref: 'client:4'},
          },
          'client:1': {
            __id: 'client:1',
            __typename: 'FriendsConnection',
            edges: {
              __refs: [],
            },
          },
          'client:4': {
            __id: 'client:4',
            __typename: 'Photo',
            // uri is missing
          },
        };
        const source = RelayRecordSource.create(sampleData);
        const target = RelayRecordSource.create();
        const environment = createMockEnvironment({
          store: new RelayModernStore(source),
        });

        // Invalidate record
        environment.commitUpdate(storeProxy => {
          const user = storeProxy.get('1');
          if (!user) {
            throw new Error('Expected to find record with id "1"');
          }
          user.invalidateRecord();
        });

        const status = check(
          source,
          target,
          createNormalizationSelector(Query.fragment, ROOT_ID, {
            id: '1',
            size: 32,
          }),
          [],
          null,
          defaultGetDataID,
        );

        // Assert that result is missing
        expect(status).toEqual({
          status: 'missing',
          mostRecentlyInvalidatedAt: null,
        });
        expect(target.size()).toBe(0);
      });
    });
  });

  it('returns true when a non-Node record is "missing" an id', () => {
    const {TestFragment} = generateAndCompile(`
      fragment TestFragment on Query {
        maybeNodeInterface {
          # This "... on Node { id }" selection would be generated if not present
          ... on Node { id }
          ... on NonNodeNoID {
            name
          }
        }
      }
    `);
    const data = {
      'client:root': {
        __id: 'client:root',
        __typename: 'Query',
        maybeNodeInterface: {__ref: 'client:root:maybeNodeInterface'},
      },
      'client:root:maybeNodeInterface': {
        __id: 'client:root:maybeNodeInterface',
        __typename: 'NonNodeNoID',
        __isNode: false,
        name: 'Alice',
      },
    };
    const source = RelayRecordSource.create(data);
    const target = RelayRecordSource.create();
    const status = check(
      source,
      target,
      createNormalizationSelector(TestFragment, 'client:root', {}),
      [],
      null,
      defaultGetDataID,
    );
    expect(status).toEqual({
      status: 'available',
      mostRecentlyInvalidatedAt: null,
    });
    expect(target.size()).toBe(0);
  });

  it('returns false when a Node record is missing an id', () => {
    const {TestFragment} = generateAndCompile(`
      fragment TestFragment on Query {
        maybeNodeInterface {
          # This "... on Node { id }" selection would be generated if not
          # present, and is flattened since Node is abstract
          ... on Node { id }
          ... on NonNodeNoID {
            name
          }
        }
      }
    `);
    const data = {
      'client:root': {
        __id: 'client:root',
        __typename: 'Query',
        maybeNodeInterface: {__ref: '1'},
      },
      '1': {
        __id: '1',
        __typename: 'User',
        name: 'Alice',
        // no `id` value
      },
    };
    const source = RelayRecordSource.create(data);
    const target = RelayRecordSource.create();
    const status = check(
      source,
      target,
      createNormalizationSelector(TestFragment, 'client:root', {}),
      [],
      null,
      defaultGetDataID,
    );
    expect(status).toEqual({
      status: 'missing',
      mostRecentlyInvalidatedAt: null,
    });
    expect(target.size()).toBe(0);
  });

  describe('with feature ENABLE_PRECISE_TYPE_REFINEMENT', () => {
    beforeEach(() => {
      RelayFeatureFlags.ENABLE_PRECISE_TYPE_REFINEMENT = true;
    });
    afterEach(() => {
      RelayFeatureFlags.ENABLE_PRECISE_TYPE_REFINEMENT = false;
    });

    it('returns `missing` when a Node record is missing an id', () => {
      const {TestFragment} = generateAndCompile(`
      fragment TestFragment on Query {
        maybeNodeInterface {
          # This "... on Node { id }" selection would be generated if not present
          ... on Node { id }
          ... on NonNodeNoID {
            name
          }
        }
      }
    `);
      const data = {
        'client:root': {
          __id: 'client:root',
          __typename: 'Query',
          maybeNodeInterface: {__ref: '1'},
        },
        '1': {
          __id: '1',
          __typename: 'User',
          __isNode: true,
          name: 'Alice',
          // no `id` value
        },
      };
      const source = RelayRecordSource.create(data);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(TestFragment, 'client:root', {}),
        [],
        null,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'missing',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });
    it('returns `missing` when an abstract refinement is only missing the discriminator field', () => {
      const {TestFragment} = generateAndCompile(`
      fragment TestFragment on Query {
        maybeNodeInterface {
          # This "... on Node { id }" selection would be generated if not present
          ... on Node { id }
          ... on NonNodeNoID {
            name
          }
        }
      }
    `);
      const data = {
        'client:root': {
          __id: 'client:root',
          __typename: 'Query',
          maybeNodeInterface: {__ref: '1'},
        },
        '1': {
          __id: '1',
          __typename: 'User',
          // __isNode: true, // dont know if it implements Node or not
          name: 'Alice',
          id: '1',
        },
      };
      const source = RelayRecordSource.create(data);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(TestFragment, 'client:root', {}),
        [],
        null,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'missing',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns `available` when a record is only missing fields in non-implemented interfaces', () => {
      const {TestFragment} = generateAndCompile(`
      fragment TestFragment on Query {
        maybeNodeInterface {
          # This "... on Node { id }" selection would be generated if not present
          ... on Node { id }
          ... on NonNodeNoID {
            name
          }
        }
      }
    `);
      const typeID = generateTypeID('NonNodeNoID');
      const data = {
        'client:root': {
          __id: 'client:root',
          __typename: 'Query',
          maybeNodeInterface: {__ref: '1'},
        },
        '1': {
          __id: '1',
          __typename: 'NonNodeNoID',
          // no 'id' bc not a Node
          name: 'Not a Node!',
        },
        [typeID]: {
          __id: typeID,
          __typename: TYPE_SCHEMA_TYPE,
          __isNode: false,
        },
      };
      const source = RelayRecordSource.create(data);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(TestFragment, 'client:root', {}),
        [],
        null,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'available',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
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

      ({FlightQuery, InnerQuery} = generateAndCompile(
        `
        query FlightQuery($id: ID!, $count: Int!) {
          node(id: $id) {
            ... on Story {
              flightComponent(condition: true, count: $count, id: $id)
            }
          }
        }

        query InnerQuery($id: ID!) {
          node(id: $id) {
            ... on User {
              name
            }
          }
        }

        extend type Story {
          flightComponent(
            condition: Boolean!
            count: Int!
            id: ID!
          ): ReactFlightComponent
            @react_flight_component(name: "FlightComponent.server")
        }
        `,
      ));
      operationLoader = {
        get: jest.fn(() => InnerQuery),
        load: jest.fn(() => Promise.resolve(InnerQuery)),
      };
    });
    afterEach(() => {
      RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = false;
    });

    it('returns available when the Flight field is fetched', () => {
      const data = {
        '1': {
          __id: '1',
          __typename: 'Story',
          'flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})': {
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
        'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})': {
          __id:
            'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})',
          __typename: 'ReactFlightComponent',
          queries: [
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
      const source = RelayRecordSource.create(data);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(FlightQuery.fragment, ROOT_ID, {
          count: 10,
          id: '1',
        }),
        [],
        operationLoader,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'available',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns missing when the Flight field exists but has not been processed', () => {
      const data = {
        '1': {
          __id: '1',
          __typename: 'Story',
          'flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})': {
            __ref:
              'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})',
          },
          id: '1',
        },
        'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})': {
          __id:
            'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})',
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
      const source = RelayRecordSource.create(data);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(FlightQuery.fragment, ROOT_ID, {
          count: 10,
          id: '1',
        }),
        [],
        operationLoader,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'missing',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns missing when the Flight field is null in the store', () => {
      const data = {
        '1': {
          __id: '1',
          __typename: 'Story',
          'flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})': {
            __ref:
              'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})',
          },
          id: '1',
        },
        'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})': null,
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {
            __ref: '1',
          },
        },
      };
      const source = RelayRecordSource.create(data);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(FlightQuery.fragment, ROOT_ID, {
          count: 10,
          id: '1',
        }),
        [],
        operationLoader,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'missing',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns missing when the Flight field is undefined in the store', () => {
      const data = {
        '1': {
          __id: '1',
          __typename: 'Story',
          'flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})': {
            __ref:
              'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})',
          },
          id: '1',
        },
        'client:1:flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})': undefined,
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {
            __ref: '1',
          },
        },
      };
      const source = RelayRecordSource.create(data);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(FlightQuery.fragment, ROOT_ID, {
          count: 10,
          id: '1',
        }),
        [],
        operationLoader,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'missing',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });

    it('returns missing when the linked ReactFlightClientResponseRecord is missing', () => {
      const data = {
        '1': {
          __id: '1',
          __typename: 'Story',
          'flight(component:"FlightComponent.server",props:{"condition":true,"count":10,"id":"1"})': {
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
      const source = RelayRecordSource.create(data);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        createNormalizationSelector(FlightQuery.fragment, ROOT_ID, {
          count: 10,
          id: '1',
        }),
        [],
        operationLoader,
        defaultGetDataID,
      );
      expect(status).toEqual({
        status: 'missing',
        mostRecentlyInvalidatedAt: null,
      });
      expect(target.size()).toBe(0);
    });
  });
});
