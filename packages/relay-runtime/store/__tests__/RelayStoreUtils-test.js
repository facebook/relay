/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

jest
  .autoMockOff();

const formatStorageKey = require('formatStorageKey');

const RelayStoreUtils = require('RelayStoreUtils');
const RelayStaticTestUtils = require('RelayStaticTestUtils');

const {generateAndCompile} = RelayStaticTestUtils;

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
      const variables = {order:  'name'};
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
      expect(RelayStoreUtils.getStorageKey(field, {}))
          .toBe('profilePicture{"size":128}');
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
      expect(RelayStoreUtils.getStorageKey(field, {size: 256}))
          .toBe('profilePicture{"size":256}');
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
      expect(RelayStoreUtils.getStorageKey(field, {preset: null, size: 128}))
          .toBe('profilePicture{"size":128}');
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
      expect(RelayStoreUtils.getStorageKey(field, {preset: null, size: null}))
          .toBe('profilePicture');
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
      expect(RelayStoreUtils.getStorageKey(field, {}))
        .toBe('storySearch{"query":{"limit":10,"offset":100,"text":"foo"}}');
    });
  });

  describe('formatStorageKey()', () => {
    it('imposes a stable ordering', () => {
      const fieldName = 'foo';
      const argsWithValues = {
        first: 10,
        orderBy: ['name', 'age', 'date'],
        filter: {
          minSize: 200,
          color: 'red',
          maxCost: 20,
        },
      };
      expect(formatStorageKey(fieldName, argsWithValues))
        .toBe(
          'foo{"filter":{"color":"red","maxCost":20,"minSize":200},' +
          '"first":10,"orderBy":["name","age","date"]}'
        );
    });

    it('filters arguments without values', () => {
      const fieldName = 'foo';
      const argsWithValues = {
        first: 10,
        orderBy: null,
      };
      expect(formatStorageKey(fieldName, argsWithValues))
        .toBe('foo{"first":10}');
    });

    it('suppresses the argument list if all values are unset', () => {
      const fieldName = 'foo';
      const argsWithValues = {
        first: undefined,
        orderBy: null,
      };
      expect(formatStorageKey(fieldName, argsWithValues))
        .toBe('foo');
    });

    it('disregards a null or undefined arguments object', () => {
      expect(formatStorageKey('foo')).toBe('foo');
      expect(formatStorageKey('bar', null)).toBe('bar');
    });
  });
});
