/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

jest.disableAutomock();

const RelayModernTestUtils = require('RelayModernTestUtils');
const {
  getFragmentVariables,
  getOperationVariables,
} = require('RelayConcreteVariables');

describe('RelayConcreteVariables', () => {
  const {generateAndCompile} = RelayModernTestUtils;

  beforeEach(() => {
    jest.resetModules();
  });

  describe('getFragmentVariables()', () => {
    /**
     * defs: size: [Int]
     * root vars: n/a
     * arg vars: {size: 42}
     * => size: 42
     */
    it('sets variables to literal argument values', () => {
      const {Fragment} = generateAndCompile(`
        fragment Fragment on User @argumentDefinitions(
          size: {type: "[Int]"}
        ) {
          profilePicture(size: $size) { uri }
        }
      `);
      const variables = getFragmentVariables(
        Fragment,
        {},
        {size: 42}
      );
      expect(variables).toEqual({
        size: 42,
      });
    });

    /**
     * defs: size: [Int] = 42
     * root vars: n/a
     * arg vars: n/a
     * => size: 42
     */
    it('sets variables to default values if defined and no argument', () => {
      const {Fragment} = generateAndCompile(`
        fragment Fragment on User @argumentDefinitions(
          size: {type: "[Int]", defaultValue: 42}
        ) {
          profilePicture(size: $size) { uri }
        }
      `);
      const variables = getFragmentVariables(
        Fragment,
        {},
        {}
      );
      expect(variables).toEqual({
        size: 42,
      });
    });

    /**
     * defs: size: [Int] = import 'rootSize'
     * root vars: rootSize: 42
     * arg vars: n/a
     * => size: 42
     */
    it('resolves imported values from root variables', () => {
      const {Fragment} = generateAndCompile(`
        fragment Fragment on User {
          profilePicture(size: $size) { uri }
        }
      `);
      const variables = getFragmentVariables(
        Fragment,
        {size: 42},
        {}
      );
      expect(variables).toEqual({
        size: 42,
      });
    });
  });

  describe('getOperationVariables()', () => {
    it('filters extraneous variables', () => {
      const {Query} = generateAndCompile(`
        query Query($id: ID!) {
          node(id: $id) { id }
        }
      `);
      const variables = getOperationVariables(
        Query,
        {
          id: '4',
          count: 10, // not defined on Query
        },
      );
      expect(variables).toEqual({
        id: '4',
        // count is filtered out
      });
    });

    it('sets default values', () => {
      const {Query} = generateAndCompile(`
        query Query(
          $id: ID = "beast",
          $count: Int = 10,
          $order: [String] = ["name"]
        ) {
          node(id: $id) {
            ... on User {
              friends(first: $count, orderby: $order) {
                edges { node { id } }
              }
            }
          }
        }
      `);
      const variables = getOperationVariables(
        Query,
        {
          id: '4',
          // no count
          order: null,
        },
      );
      expect(variables).toEqual({
        id: '4',          // user value overwrites default
        count: 10,        // set to default
        order: ['name'],  // set to default
      });
    });
  });
});
