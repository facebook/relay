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

const {graphql} = require('../../query/GraphQLTag');
const {
  getFragmentVariables,
  getOperationVariables,
} = require('../RelayConcreteVariables');

describe('RelayConcreteVariables', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('getFragmentVariables()', () => {
    describe('sets variables to literal argument values', () => {
      it('correctly sets argument value', () => {
        const Fragment = graphql`
          fragment RelayConcreteVariablesTest1Fragment on User
          @argumentDefinitions(size: {type: "[Int]"}) {
            profilePicture(size: $size) {
              uri
            }
          }
        `;
        const variables = getFragmentVariables(Fragment, {}, {size: 32});
        expect(variables).toEqual({
          size: 32,
        });
      });

      it('correctly sets boolean argument values', () => {
        const Fragment = graphql`
          fragment RelayConcreteVariablesTest2Fragment on User
          @argumentDefinitions(condition: {type: "Boolean"}) {
            firstName(if: $condition)
          }
        `;
        const variables = getFragmentVariables(
          Fragment,
          {},
          {condition: false},
        );
        expect(variables).toEqual({
          condition: false,
        });
      });

      it('correctly sets null argument values', () => {
        const Fragment = graphql`
          fragment RelayConcreteVariablesTest3Fragment on User
          @argumentDefinitions(condition: {type: "Boolean"}) {
            firstName(if: $condition)
          }
        `;
        const variables = getFragmentVariables(Fragment, {}, {condition: null});
        expect(variables).toEqual({
          condition: null,
        });
      });

      it('correctly ignores default value when argument passed', () => {
        const Fragment = graphql`
          fragment RelayConcreteVariablesTest4Fragment on User
          @argumentDefinitions(size: {type: "[Int]", defaultValue: 42}) {
            profilePicture(size: $size) {
              uri
            }
          }
        `;
        const variables = getFragmentVariables(Fragment, {}, {size: 32});
        expect(variables).toEqual({
          size: 32,
        });
      });

      it('correctly sets argument value even if variable is available in root variables', () => {
        const Fragment = graphql`
          fragment RelayConcreteVariablesTest5Fragment on User
          @argumentDefinitions(size: {type: "[Int]"}) {
            profilePicture(size: $size) {
              uri
            }
          }
        `;
        const variables = getFragmentVariables(
          Fragment,
          {size: 16},
          {size: 32},
        );
        expect(variables).toEqual({
          size: 32,
        });
      });
    });

    it('only includes variables being referenced in fragment, regardless of rootVariables in global scope', () => {
      const Fragment = graphql`
        fragment RelayConcreteVariablesTest6Fragment on User
        @argumentDefinitions(size: {type: "[Int]"}) {
          profilePicture(size: $size) {
            uri
          }
        }
      `;
      const variables = getFragmentVariables(
        Fragment,
        {size: 16, id: '1'},
        {size: 42},
      );
      expect(variables).toEqual({
        size: 42,
      });
    });

    it('sets variables to null if fragment has @argumentDefinitions but no argument passed, regardless if variable is available in global rootVariables scope', () => {
      const Fragment = graphql`
        fragment RelayConcreteVariablesTest7Fragment on User
        @argumentDefinitions(size: {type: "[Int]"}) {
          profilePicture(size: $size) {
            uri
          }
        }
      `;
      const variables = getFragmentVariables(Fragment, {size: 16}, {});
      expect(variables).toEqual({
        size: null,
      });
    });

    /**
     * defs: size: [Int] = 42
     * root vars: size: [Int] = 16
     * arg vars: n/a
     * => size: 42
     */
    it('sets variables to default values if defined and no argument passed even if root variable is available', () => {
      const Fragment = graphql`
        fragment RelayConcreteVariablesTest8Fragment on User
        @argumentDefinitions(size: {type: "[Int]", defaultValue: 42}) {
          profilePicture(size: $size) {
            uri
          }
        }
      `;
      const variables = getFragmentVariables(Fragment, {size: 16}, {});
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
    it('sets variables to default values if defined and no argument passed and no root variable available', () => {
      const Fragment = graphql`
        fragment RelayConcreteVariablesTest9Fragment on User
        @argumentDefinitions(size: {type: "[Int]", defaultValue: 42}) {
          profilePicture(size: $size) {
            uri
          }
        }
      `;
      const variables = getFragmentVariables(Fragment, {}, {});
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
    it('resolves imported values from root variables if no @argumentDefintions defined', () => {
      const Fragment = graphql`
        fragment RelayConcreteVariablesTest10Fragment on User {
          profilePicture(size: $size) {
            uri
          }
        }
      `;
      const variables = getFragmentVariables(Fragment, {size: 42}, {});
      expect(variables).toEqual({
        size: 42,
      });
    });
  });

  describe('getOperationVariables()', () => {
    it('filters extraneous variables', () => {
      const Query = graphql`
        query RelayConcreteVariablesTest1Query($id: ID!) {
          node(id: $id) {
            id
          }
        }
      `;
      const variables = getOperationVariables(Query.operation, {
        id: '4',
        count: 10, // not defined on Query
      });
      expect(variables).toEqual({
        id: '4',
        // count is filtered out
      });
    });

    it('sets default values', () => {
      const Query = graphql`
        query RelayConcreteVariablesTest2Query(
          $id: ID = "beast"
          $count: Int = 10
          $order: [String] = ["name"]
        ) {
          node(id: $id) {
            ... on User {
              friends(first: $count, orderby: $order) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        }
      `;
      const variables = getOperationVariables(Query.operation, {
        id: '4',
        // no count
        order: null,
      });
      expect(variables).toEqual({
        id: '4', // user value overwrites default
        count: 10, // set to default
        order: ['name'], // set to default
      });
    });
  });
});
