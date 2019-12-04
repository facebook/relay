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

const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernTestUtils = require('relay-test-utils-internal');
const RelayStoreUtils = require('../RelayStoreUtils');

const {generateAndCompile} = RelayModernTestUtils;

describe('RelayStoreUtils', () => {
  describe('getArgumentValues()', () => {
    it('returns argument values', () => {
      const {UserFragment} = generateAndCompile(`
        fragment UserFragment on User {
          friends(orderby: $order, first: 10) {
            count
          }
        }
      `);
      const field = UserFragment.selections[0];
      const variables = {order: 'name'};
      expect(RelayStoreUtils.getArgumentValues(field.args, variables)).toEqual({
        first: 10,
        orderby: 'name',
      });
    });
  });

  describe('getStorageKey()', () => {
    it('uses the field name when there are no arguments', () => {
      const {UserFragment} = generateAndCompile(`
        fragment UserFragment on User {
          name
        }
      `);
      const field = UserFragment.selections[0];
      expect(RelayStoreUtils.getStorageKey(field, {})).toBe('name');
    });

    it('embeds literal argument values', () => {
      const {UserFragment} = generateAndCompile(`
        fragment UserFragment on User {
          profilePicture(size: 128) {
            uri
          }
        }
      `);
      const field = UserFragment.selections[0];
      expect(RelayStoreUtils.getStorageKey(field, {})).toBe(
        'profilePicture(size:128)',
      );
    });

    it('embeds variable values', () => {
      const {UserFragment} = generateAndCompile(`
        fragment UserFragment on User @argumentDefinitions(
          size: {type: "[Int]"}
        ) {
          profilePicture(size: $size) {
            uri
          }
        }
      `);
      const field = UserFragment.selections[0];
      expect(RelayStoreUtils.getStorageKey(field, {size: 256})).toBe(
        'profilePicture(size:256)',
      );
    });

    it('filters out arguments that are unset', () => {
      const {UserFragment} = generateAndCompile(`
        fragment UserFragment on User @argumentDefinitions(
          preset: {type: "PhotoSize"}
          size: {type: "[Int]"}
        ) {
          profilePicture(preset: $preset, size: $size) {
            uri
          }
        }
      `);
      const field = UserFragment.selections[0];
      expect(
        RelayStoreUtils.getStorageKey(field, {preset: null, size: 128}),
      ).toBe('profilePicture(size:128)');
    });

    it('suppresses the argument list if all values are unset', () => {
      const {UserFragment} = generateAndCompile(`
        fragment UserFragment on User @argumentDefinitions(
          preset: {type: "PhotoSize"}
          size: {type: "[Int]"}
        ) {
          profilePicture(preset: $preset, size: $size) {
            uri
          }
        }
      `);
      const field = UserFragment.selections[0];
      expect(
        RelayStoreUtils.getStorageKey(field, {preset: null, size: null}),
      ).toBe('profilePicture');
    });

    it('imposes a stable ordering within object arguments', () => {
      const {UserFragment} = generateAndCompile(`
        fragment UserFragment on User {
          # Pass in arguments reverse-lexicographical order.
          storySearch(query: {text: "foo", offset: 100, limit: 10}) {
            id
          }
        }
      `);
      const field = UserFragment.selections[0];

      // Note that storage key employs stable lexicographical ordering anyway.
      expect(RelayStoreUtils.getStorageKey(field, {})).toBe(
        'storySearch(query:{"limit":10,"offset":100,"text":"foo"})',
      );
    });

    it('supports complex objects', () => {
      const {UserFragment} = generateAndCompile(`
        fragment UserFragment on User {
          # Pass in arguments reverse-lexicographical order.
          storySearch(query: {text: $foo, offset: 100, limit: 10}) {
            id
          }
        }
      `);
      const field = UserFragment.selections[0];

      // Note that storage key employs stable lexicographical ordering anyway.
      expect(
        RelayStoreUtils.getStorageKey(field, {
          foo: 'Foo Text',
        }),
      ).toBe('storySearch(query:{"limit":10,"offset":100,"text":"Foo Text"})');
    });
  });

  describe('getStableStorageKey()', () => {
    it('imposes a stable ordering', () => {
      const fieldName = 'foo';
      const argValues = {
        first: 10,
        orderBy: ['name', 'age', 'date'],
        filter: {
          minSize: 200,
          color: 'red',
          maxCost: 20,
        },
      };
      expect(RelayStoreUtils.getStableStorageKey(fieldName, argValues)).toBe(
        'foo(filter:{"color":"red","maxCost":20,"minSize":200},' +
          'first:10,orderBy:["name","age","date"])',
      );
    });

    it('filters arguments without values', () => {
      const fieldName = 'foo';
      const argValues = {
        first: 10,
        orderBy: null,
      };
      expect(RelayStoreUtils.getStableStorageKey(fieldName, argValues)).toBe(
        'foo(first:10)',
      );
    });

    it('suppresses the argument list if all values are unset', () => {
      const fieldName = 'foo';
      const argValues = {
        first: undefined,
        orderBy: null,
      };
      expect(RelayStoreUtils.getStableStorageKey(fieldName, argValues)).toBe(
        'foo',
      );
    });

    it('disregards a null or undefined arguments object', () => {
      expect(RelayStoreUtils.getStableStorageKey('foo')).toBe('foo');
      expect(RelayStoreUtils.getStableStorageKey('bar', null)).toBe('bar');
    });
  });

  describe('getHandleStorageKey', () => {
    beforeEach(() => {
      RelayFeatureFlags.ENABLE_VARIABLE_CONNECTION_KEY = true;
    });

    afterEach(() => {
      RelayFeatureFlags.ENABLE_VARIABLE_CONNECTION_KEY = false;
    });

    it('creates a key with no arguments', () => {
      const {UserQuery} = generateAndCompile(`
        query UserQuery {
          me {
            address @__clientField(key: "UserQuery_address", handle: "addressHandler") {
              city
            }
          }
        }
      `);
      const handle = UserQuery.operation.selections[0].selections.find(
        selection => selection.kind === 'LinkedHandle',
      );
      const key = RelayStoreUtils.getHandleStorageKey(handle, {});
      expect(key).toBe('__UserQuery_address_addressHandler');
    });

    it('creates a key with arguments', () => {
      const {UserQuery} = generateAndCompile(`
        query UserQuery {
          me {
            profile_picture(scale: 42)
            @__clientField(key: "UserQuery_profile_picture", handle: "photoHandler") {
              uri
            }
          }
        }
      `);
      const handle = UserQuery.operation.selections[0].selections.find(
        selection => selection.kind === 'LinkedHandle',
      );
      const key = RelayStoreUtils.getHandleStorageKey(handle, {});
      expect(key).toBe('__UserQuery_profile_picture_photoHandler');
    });

    it('creates a key with arguments and filters', () => {
      const {UserQuery} = generateAndCompile(`
        query UserQuery {
          me {
            profile_picture(scale: 42)
            @__clientField(key: "UserQuery_profile_picture", handle: "photoHandler", filters: ["scale"]) {
              uri
            }
          }
        }
      `);
      const handle = UserQuery.operation.selections[0].selections.find(
        selection => selection.kind === 'LinkedHandle',
      );
      const key = RelayStoreUtils.getHandleStorageKey(handle, {});
      expect(key).toBe('__UserQuery_profile_picture_photoHandler(scale:42)');
    });

    it('creates a dynamic connection key', () => {
      const {UserQuery} = generateAndCompile(`
        query UserQuery($count: Int!, $cursor: ID, $dynamicKey: String!) {
          me {
            friends(after: $cursor, first: $count) @connection(
              key: "UserQuery_friends"
              dynamicKey_UNSTABLE: $dynamicKey
            ) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `);
      const handle = UserQuery.operation.selections[0].selections.find(
        selection => selection.kind === 'LinkedHandle',
      );
      const key = RelayStoreUtils.getHandleStorageKey(handle, {
        count: 5,
        cursor: null,
        dynamicKey: 'xyz',
      });
      expect(key).toBe('__UserQuery_friends_connection(__dynamicKey:"xyz")');
    });

    it('creates a dynamic connection key with filters', () => {
      const {UserQuery} = generateAndCompile(`
        query UserQuery($count: Int!, $cursor: ID, $dynamicKey: String!) {
          me {
            friends(after: $cursor, first: $count, orderby: ["name"])
            @connection(
              key: "UserQuery_friends"
              dynamicKey_UNSTABLE: $dynamicKey
              filters: ["orderby"]
            ) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `);
      const variables = {
        count: 5,
        cursor: null,
        dynamicKey: 'xyz',
      };
      const handle = UserQuery.operation.selections[0].selections.find(
        selection => selection.kind === 'LinkedHandle',
      );
      const normalizationKey = RelayStoreUtils.getHandleStorageKey(
        handle,
        variables,
      );
      expect(normalizationKey).toBe(
        '__UserQuery_friends_connection(__dynamicKey:"xyz",orderby:["name"])',
      );
      const field = UserQuery.fragment.selections
        .find(
          selection =>
            selection.kind === 'LinkedField' && selection.name === 'me',
        )
        .selections.find(
          selection =>
            selection.kind === 'LinkedField' && selection.alias === 'friends',
        );
      expect(field).not.toBe(null);
      const readerKey = RelayStoreUtils.getStorageKey(field, variables);
      expect(readerKey).toBe(normalizationKey);
    });
  });
});
