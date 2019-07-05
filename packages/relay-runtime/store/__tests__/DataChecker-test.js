/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+relay
 */

'use strict';

const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernRecord = require('../RelayModernRecord');
const RelayRecordSource = require('../RelayRecordSource');

const defaultGetDataID = require('../defaultGetDataID');
const getRelayHandleKey = require('../../util/getRelayHandleKey');

const {check} = require('../DataChecker');
const {ROOT_ID} = require('../RelayStoreUtils');
const {generateAndCompile} = require('relay-test-utils-internal');

beforeEach(() => {
  jest.resetModules();
});

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
    ({Query} = generateAndCompile(
      `
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
      `,
    ));
  });

  it('reads query data', () => {
    const source = RelayRecordSource.create(sampleData);
    const target = RelayRecordSource.create();
    const status = check(
      source,
      target,
      {
        dataID: ROOT_ID,
        node: Query.fragment,
        variables: {id: '1', size: 32},
      },
      [],
      null,
      defaultGetDataID,
    );
    expect(status).toBe(true);
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
    const {BarFragment} = generateAndCompile(
      `
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
      `,
    );
    const status = check(
      source,
      target,
      {
        dataID: '1',
        node: BarFragment,
        variables: {size: 32},
      },
      [],
      null,
      defaultGetDataID,
    );
    expect(status).toBe(true);
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
    const {Fragment} = generateAndCompile(
      `
          fragment Fragment on User {
            profilePicture(size: 32) @__clientField(handle: "test") {
              uri
            }
          }
        `,
    );
    const status = check(
      source,
      target,
      {
        dataID: '1',
        node: Fragment,
        variables: {},
      },
      [],
      null,
      defaultGetDataID,
    );
    expect(status).toBe(true);
    expect(target.size()).toBe(0);
  });

  describe('when @match directive is present', () => {
    let BarQuery;
    let loader;

    beforeEach(() => {
      const nodes = generateAndCompile(
        `
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
          }`,
      );
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
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
        [],
        loader,
        defaultGetDataID,
      );
      expect(loader.get).toBeCalledTimes(1);
      expect(loader.get.mock.calls[0][0]).toBe(
        'PlainUserNameRenderer_name$normalization.graphql',
      );
      expect(status).toBe(true);
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
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
        [],
        loader,
        defaultGetDataID,
      );
      expect(status).toBe(true);
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
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
        [],
        // Return null to indicate the fragment is not loaded yet
        {
          get: _ => null,
          load: _ => Promise.resolve(null),
        },
        defaultGetDataID,
      );
      // The data for the field isn't in the store yet, so we have to return false
      expect(status).toBe(false);
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
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
        [],
        loader,
        defaultGetDataID,
      );
      // The data for the field 'data' isn't in the store yet, so we have to return false
      expect(status).toBe(false);
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
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
        [],
        loader,
        defaultGetDataID,
      );
      // The data for the field 'data' isn't in the store yet, so we have to return false
      expect(status).toBe(false);
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
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
        [],
        loader,
        defaultGetDataID,
      );
      expect(status).toBe(true);
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
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
        [],
        loader,
        defaultGetDataID,
      );
      expect(status).toBe(true);
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
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
        [],
        loader,
        defaultGetDataID,
      );
      expect(status).toBe(false);
      expect(target.size()).toBe(0);
    });
  });

  describe('when @module directive is present', () => {
    let BarQuery;
    let loader;

    beforeEach(() => {
      const nodes = generateAndCompile(
        `
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
          }`,
      );
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
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
        [],
        loader,
        defaultGetDataID,
      );
      expect(loader.get).toBeCalledTimes(1);
      expect(loader.get.mock.calls[0][0]).toBe(
        'PlainUserNameRenderer_name$normalization.graphql',
      );
      expect(status).toBe(true);
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
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
        [],
        loader,
        defaultGetDataID,
      );
      expect(status).toBe(true);
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
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
        [],
        // Return null to indicate the fragment is not loaded yet
        {
          get: _ => null,
          load: _ => Promise.resolve(null),
        },
        defaultGetDataID,
      );
      // The data for the field isn't in the store yet, so we have to return false
      expect(status).toBe(false);
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
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
        [],
        loader,
        defaultGetDataID,
      );
      // The data for the field 'data' isn't in the store yet, so we have to return false
      expect(status).toBe(false);
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
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
        [],
        loader,
        defaultGetDataID,
      );
      // The data for the field 'data' isn't in the store yet, so we have to return false
      expect(status).toBe(false);
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
        {
          dataID: 'client:root',
          node: BarQuery.operation,
          variables: {id: '1'},
        },
        [],
        loader,
        defaultGetDataID,
      );
      expect(status).toBe(true);
      expect(target.size()).toBe(0);
    });
  });

  describe('when @defer directive is present', () => {
    beforeEach(() => {
      const nodes = generateAndCompile(
        `
          fragment TestFragment on User {
            id
            name
          }

          query TestQuery($id: ID!) {
            node(id: $id) {
              ...TestFragment @defer(label: "TestFragment")
            }
          }`,
      );
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
        {
          dataID: 'client:root',
          node: Query.operation,
          variables: {id: '1'},
        },
        [],
        null,
        defaultGetDataID,
      );
      expect(status).toBe(true);
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
        {
          dataID: 'client:root',
          node: Query.operation,
          variables: {id: '1'},
        },
        [],
        null,
        defaultGetDataID,
      );
      expect(status).toBe(false);
      expect(target.size()).toBe(0);
    });
  });

  describe('when @stream directive is present', () => {
    beforeEach(() => {
      const nodes = generateAndCompile(
        `
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
          }`,
      );
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
        {
          dataID: 'client:root',
          node: Query.operation,
          variables: {id: '1'},
        },
        [],
        null,
        defaultGetDataID,
      );
      expect(status).toBe(true);
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
        {
          dataID: 'client:root',
          node: Query.operation,
          variables: {id: '1'},
        },
        [],
        null,
        defaultGetDataID,
      );
      expect(status).toBe(false);
      expect(target.size()).toBe(0);
    });
  });

  describe('when the data is complete', () => {
    it('returns `true`', () => {
      const source = RelayRecordSource.create(sampleData);
      const target = RelayRecordSource.create();
      const status = check(
        source,
        target,
        {
          dataID: ROOT_ID,
          node: Query.fragment,
          variables: {id: '1', size: 32},
        },
        [],
        null,
        defaultGetDataID,
      );
      expect(status).toBe(true);
      expect(target.size()).toBe(0);
    });
  });

  describe('when some data is missing', () => {
    it('returns false on missing records', () => {
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
      const {BarFragment} = generateAndCompile(
        `
            fragment BarFragment on User @argumentDefinitions(
              size: {type: "[Int]"}
            ) {
              id
              firstName
              profilePicture(size: $size) {
                uri
              }
            }
          `,
      );
      const status = check(
        source,
        target,
        {
          dataID: '1',
          node: BarFragment,
          variables: {size: 32},
        },
        [],
        null,
        defaultGetDataID,
      );
      expect(status).toBe(false);
      expect(target.size()).toBe(0);
    });

    it('returns false on missing fields', () => {
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
      const {BarFragment} = generateAndCompile(
        `
          fragment BarFragment on User @argumentDefinitions(
            size: {type: "[Int]"}
          ) {
            id
            firstName
            profilePicture(size: $size) {
              uri
            }
          }
        `,
      );
      const status = check(
        source,
        target,
        {
          dataID: '1',
          node: BarFragment,
          variables: {size: 32},
        },
        [],
        null,
        defaultGetDataID,
      );
      expect(status).toBe(false);
      expect(target.size()).toBe(0);
    });

    it('allows handlers to supplement missing fields', () => {
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
      const {BarFragment} = generateAndCompile(
        `
          fragment BarFragment on User @argumentDefinitions(
            size: {type: "[Int]"}
          ) {
            id
            firstName
            profilePicture(size: $size) {
              uri
            }
          }
        `,
      );
      const status = check(
        source,
        target,
        {
          dataID: '1',
          node: BarFragment,
          variables: {size: 32},
        },
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
      expect(status).toBe(true);
      expect(target.toJSON()).toEqual({
        'client:3': {
          __id: 'client:3',
          __typename: undefined,
          uri: 'thebestimage.uri',
        },
      });
    });

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
      const {BarFragment} = generateAndCompile(
        `
          fragment BarFragment on User @argumentDefinitions(
            size: {type: "[Int]"}
          ) {
            id
            firstName
            profilePicture(size: $size) {
              uri
            }
          }
        `,
      );
      const status = check(
        source,
        target,
        {
          dataID: '1',
          node: BarFragment,
          variables: {size: 32},
        },
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
      expect(status).toBe(true);
      expect(target.toJSON()).toEqual({
        '1': {
          __id: '1',
          __typename: 'User',
          firstName: 'Alice',
          'profilePicture(size:32)': {__ref: 'profile_1_32'},
        },
      });
    });

    it('returns true even when client field is missing', () => {
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
      const {BarFragment} = generateAndCompile(
        `fragment BarFragment on User @argumentDefinitions(
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
        }`,
      );
      const status = check(
        source,
        target,
        {
          dataID: '1',
          node: BarFragment,
          variables: {size: 32},
        },
        [],
        null,
        defaultGetDataID,
      );
      expect(status).toBe(true);
      expect(target.size()).toBe(0);
    });
  });
});
