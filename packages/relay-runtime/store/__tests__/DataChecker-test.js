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

const RelayModernRecord = require('../RelayModernRecord');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');

const defaultGetDataID = require('../defaultGetDataID');
const getRelayHandleKey = require('../../util/getRelayHandleKey');

const {check} = require('../DataChecker');
const {createNormalizationSelector} = require('../RelayModernSelector');
const {ROOT_ID} = require('../RelayStoreUtils');
const {
  createMockEnvironment,
  generateAndCompile,
} = require('relay-test-utils-internal');

function getEmptyConnectionEvents() {
  return null;
}

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
      null,
      defaultGetDataID,
      getEmptyConnectionEvents,
    );
    expect(status).toBe('available');
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
      null,
      defaultGetDataID,
      getEmptyConnectionEvents,
    );
    expect(status).toBe('available');
    expect(target.size()).toBe(0);
  });

  it('reads handle fields', () => {
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
      null,
      defaultGetDataID,
      getEmptyConnectionEvents,
    );
    expect(status).toBe('available');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      expect(loader.get).toBeCalledTimes(1);
      expect(loader.get.mock.calls[0][0]).toBe(
        'PlainUserNameRenderer_name$normalization.graphql',
      );
      expect(status).toBe('available');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      expect(status).toBe('available');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      // The data for the field isn't in the store yet, so we have to return false
      expect(status).toBe('missing');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      // The data for the field 'data' isn't in the store yet, so we have to return false
      expect(status).toBe('missing');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      // The data for the field 'data' isn't in the store yet, so we have to return false
      expect(status).toBe('missing');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      expect(status).toBe('available');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      expect(status).toBe('available');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      expect(status).toBe('missing');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      expect(loader.get).toBeCalledTimes(1);
      expect(loader.get.mock.calls[0][0]).toBe(
        'PlainUserNameRenderer_name$normalization.graphql',
      );
      expect(status).toBe('available');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      expect(status).toBe('available');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      // The data for the field isn't in the store yet, so we have to return false
      expect(status).toBe('missing');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      // The data for the field 'data' isn't in the store yet, so we have to return false
      expect(status).toBe('missing');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      // The data for the field 'data' isn't in the store yet, so we have to return false
      expect(status).toBe('missing');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      expect(status).toBe('available');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      expect(status).toBe('available');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      expect(status).toBe('missing');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      expect(status).toBe('available');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      expect(status).toBe('missing');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      expect(status).toBe('available');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      expect(status).toBe('missing');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      expect(status).toBe('missing');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      expect(status).toBe('available');
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
          expectedStatus: 'missing',
          updatedHometown: undefined,
        },
      ],
      [
        'null',
        {
          handleReturnValue: null,
          expectedStatus: 'missing',
          updatedHometown: undefined,
        },
      ],
      [
        "'hometown-exists'",
        {
          handleReturnValue: 'hometown-exists',
          expectedStatus: 'available',
          updatedHometown: 'hometown-exists',
        },
      ],
      [
        "'hometown-deleted'",
        {
          handleReturnValue: 'hometown-deleted',
          expectedStatus: 'missing',
          updatedHometown: undefined,
        },
      ],
      [
        "'hometown-unknown'",
        {
          handleReturnValue: 'hometown-unknown',
          expectedStatus: 'missing',
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
          null,
          defaultGetDataID,
          getEmptyConnectionEvents,
        );
        expect(handle).toBeCalledTimes(1);
        expect(status).toBe(expectedStatus);
        expect(target.toJSON()).toEqual(
          updatedHometown === undefined
            ? {}
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
          expectedStatus: 'missing',
          updatedScreennames: undefined,
        },
      ],
      [
        'null',
        {
          handleReturnValue: null,
          expectedStatus: 'missing',
          updatedScreennames: undefined,
        },
      ],
      [
        '[]',
        {
          handleReturnValue: [],
          expectedStatus: 'available',
          updatedScreennames: [],
        },
      ],
      [
        '[undefined]',
        {
          handleReturnValue: [undefined],
          expectedStatus: 'missing',
          updatedScreennames: undefined,
        },
      ],
      [
        '[null]',
        {
          handleReturnValue: [null],
          expectedStatus: 'missing',
          updatedScreennames: undefined,
        },
      ],
      [
        "['screenname-exists']",
        {
          handleReturnValue: ['screenname-exists'],
          expectedStatus: 'available',
          updatedScreennames: ['screenname-exists'],
        },
      ],
      [
        "['screenname-deleted']",
        {
          handleReturnValue: ['screenname-deleted'],
          expectedStatus: 'missing',
          updatedScreennames: undefined,
        },
      ],
      [
        "['screenname-unknown']",
        {
          handleReturnValue: ['screenname-unknown'],
          expectedStatus: 'missing',
          updatedScreennames: undefined,
        },
      ],
      [
        "['screenname-exists', 'screenname-unknown']",
        {
          handleReturnValue: ['screenname-exists', 'screenname-unknown'],
          expectedStatus: 'missing',
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
          null,
          defaultGetDataID,
          getEmptyConnectionEvents,
        );
        expect(handle).toBeCalledTimes(1);
        expect(status).toBe(expectedStatus);
        expect(target.toJSON()).toEqual(
          updatedScreennames == null
            ? {}
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      expect(status).toBe('available');
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
        null,
        defaultGetDataID,
        getEmptyConnectionEvents,
      );
      expect(status).toBe('available');
      expect(target.size()).toBe(0);
    });
  });

  describe('when individual records have been invalidated', () => {
    describe('when data is complete', () => {
      it('returns stale if operation has not been written before', () => {
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
          null, // pass null value for when operation was written
          defaultGetDataID,
          getEmptyConnectionEvents,
        );

        // Assert that result is stale
        expect(status).toBe('stale');
        expect(target.size()).toBe(0);
      });

      it('returns stale if operation was written before record was invalidated', () => {
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
          0, // Operation written at epoch 0, before invalidation of record
          defaultGetDataID,
          getEmptyConnectionEvents,
        );

        // Assert that result is stale
        expect(status).toBe('stale');
        expect(target.size()).toBe(0);
      });

      it('returns available if operation was written after record was invalidated', () => {
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
          2, // Operation written at epoch 1, after invalidation of record
          defaultGetDataID,
          getEmptyConnectionEvents,
        );

        // Assert that result is available
        expect(status).toBe('available');
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

      it('returns stale if operation has not been written before', () => {
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
          null, // pass null value for when operation was written
          defaultGetDataID,
          getEmptyConnectionEvents,
        );

        // Assert that result is stale
        expect(status).toBe('stale');
        expect(target.size()).toBe(0);
      });

      it('returns stale if operation was written before record was invalidated', () => {
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
          0, // Operation written at epoch 0, before invalidation of record
          defaultGetDataID,
          getEmptyConnectionEvents,
        );

        // Assert that result is stale
        expect(status).toBe('stale');
        expect(target.size()).toBe(0);
      });

      it('returns missing if stale record is unreachable', () => {
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
          0, // Operation written at epoch 0, before invalidation of record
          defaultGetDataID,
          getEmptyConnectionEvents,
        );

        // Assert that result is stale
        expect(status).toBe('missing');
        expect(target.size()).toBe(0);
      });

      it('returns missing if operation was written after record was invalidated', () => {
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
          2, // Operation written at epoch 1, after invalidation of record
          defaultGetDataID,
          getEmptyConnectionEvents,
        );

        // Assert that result is available
        expect(status).toBe('missing');
        expect(target.size()).toBe(0);
      });
    });
  });

  it('returns true when a non-Node record is "missing" an id', () => {
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
        maybeNodeInterface: {__ref: 'client:root:maybeNodeInterface'},
      },
      'client:root:maybeNodeInterface': {
        __id: 'client:root:maybeNodeInterface',
        __typename: 'NonNodeNoID',
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
      null,
      defaultGetDataID,
      getEmptyConnectionEvents,
    );
    expect(status).toBe('available');
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
      null,
      defaultGetDataID,
      getEmptyConnectionEvents,
    );
    expect(status).toBe('missing');
    expect(target.size()).toBe(0);
  });
});
