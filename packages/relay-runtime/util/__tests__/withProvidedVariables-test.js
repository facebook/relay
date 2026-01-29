/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

'use strict';

const {graphql} = require('../../query/GraphQLTag');
const withProvidedVariables = require('../withProvidedVariables');
const {
  disallowWarnings,
  expectToWarn,
  expectToWarnMany,
} = require('relay-test-utils-internal');

disallowWarnings();

describe('withProvidedVariables', () => {
  describe('singleProvidedVariable', () => {
    it('can get the correct provider', () => {
      const userQuery = graphql`
        query withProvidedVariablesTest1Query {
          node(id: 4) {
            ...withProvidedVariablesTest1Fragment @dangerously_unaliased_fixme
          }
        }
      `;
      graphql`
        fragment withProvidedVariablesTest1Fragment on User
        @argumentDefinitions(
          numberOfFriends: {
            type: "Int!"
            provider: "./provideNumberOfFriends.relayprovider"
          }
        ) {
          friends(first: $numberOfFriends) {
            count
          }
        }
      `;

      const userVariables = {};
      const newVariables = withProvidedVariables(
        userVariables,
        userQuery.params.providedVariables,
      );
      expect(
        newVariables.__relay_internal__pv__provideNumberOfFriendsrelayprovider,
      ).toEqual(15.0);
      expect(Object.keys(newVariables).length).toEqual(1);
    });
  });

  describe('singleProvidedVariableWithUserSuppliedVariable', () => {
    it('can get the correct provider and keeps user supplied variables', () => {
      const userQuery = graphql`
        query withProvidedVariablesTest2Query($includeFriendsCount: Boolean!) {
          node(id: 4) {
            ...withProvidedVariablesTest2Fragment
              @dangerously_unaliased_fixme
              @arguments(includeFriendsCount_: $includeFriendsCount)
          }
        }
      `;
      graphql`
        fragment withProvidedVariablesTest2Fragment on User
        @argumentDefinitions(
          numberOfFriends: {
            type: "Int!"
            provider: "./provideNumberOfFriends.relayprovider"
          }
          includeFriendsCount_: {type: "Boolean!"}
        ) {
          friends(first: $numberOfFriends) {
            count @include(if: $includeFriendsCount_)
          }
        }
      `;

      const userVariables = {includeFriendsCount: true};
      const newVariables = withProvidedVariables(
        userVariables,
        userQuery.params.providedVariables,
      );
      expect(
        newVariables.__relay_internal__pv__provideNumberOfFriendsrelayprovider,
      ).toEqual(15.0);
      expect(newVariables.includeFriendsCount).toEqual(true);
      expect(Object.keys(newVariables).length).toEqual(2);
    });
  });

  describe('multipleProvidedVariables', () => {
    it('can get the correct provider', () => {
      const userQuery = graphql`
        query withProvidedVariablesTest3Query {
          node(id: 4) {
            ...withProvidedVariablesTest3Fragment @dangerously_unaliased_fixme
          }
        }
      `;
      graphql`
        fragment withProvidedVariablesTest3Fragment on User
        @argumentDefinitions(
          numberOfFriends: {
            type: "Int!"
            provider: "./provideNumberOfFriends.relayprovider"
          }
          includeName: {
            type: "Boolean!"
            provider: "./provideIncludeUserNames.relayprovider"
          }
        ) {
          name @include(if: $includeName)
          friends(first: $numberOfFriends) {
            count
          }
        }
      `;

      const userVariables = {};
      const newVariables = withProvidedVariables(
        userVariables,
        userQuery.params.providedVariables,
      );
      expect(
        newVariables.__relay_internal__pv__provideNumberOfFriendsrelayprovider,
      ).toEqual(15.0);
      expect(
        newVariables.__relay_internal__pv__provideIncludeUserNamesrelayprovider,
      ).toEqual(true);
      expect(Object.keys(newVariables).length).toEqual(2);
    });
  });

  describe('multipleFragmentsProvidedVariables', () => {
    it('can get the correct provider', () => {
      const userQuery = graphql`
        query withProvidedVariablesTest4Query {
          node(id: 4) {
            ...withProvidedVariablesTest4Fragment1 @dangerously_unaliased_fixme
            ...withProvidedVariablesTest4Fragment2 @dangerously_unaliased_fixme
          }
        }
      `;
      graphql`
        fragment withProvidedVariablesTest4Fragment1 on User
        @argumentDefinitions(
          numberOfFriends: {
            type: "Int!"
            provider: "./provideNumberOfFriends.relayprovider"
          }
          includeName: {
            type: "Boolean!"
            provider: "./provideIncludeUserNames.relayprovider"
          }
        ) {
          friends(first: $numberOfFriends) {
            count
            edges {
              node {
                ... on User {
                  name @include(if: $includeName)
                }
              }
            }
          }
        }
      `;
      graphql`
        fragment withProvidedVariablesTest4Fragment2 on User
        @argumentDefinitions(
          includeName: {
            type: "Boolean!"
            provider: "./provideIncludeUserNames.relayprovider"
          }
        ) {
          name @include(if: $includeName)
        }
      `;

      const userVariables = {};
      const newVariables = withProvidedVariables(
        userVariables,
        userQuery.params.providedVariables,
      );
      expect(
        newVariables.__relay_internal__pv__provideNumberOfFriendsrelayprovider,
      ).toEqual(15.0);
      expect(
        newVariables.__relay_internal__pv__provideIncludeUserNamesrelayprovider,
      ).toEqual(true);
      expect(Object.keys(newVariables).length).toEqual(2);
    });
  });

  describe('When a provider function returns different values', () => {
    it('warns for every provider that returns a changed value', () => {
      const userQuery = graphql`
        query withProvidedVariablesTest5Query {
          node(id: 4) {
            ...withProvidedVariablesTest5Fragment @dangerously_unaliased_fixme
          }
        }
      `;
      graphql`
        fragment withProvidedVariablesTest5Fragment on User
        @argumentDefinitions(
          impureProvider1: {
            type: "Float!"
            provider: "./provideRandomNumber_invalid1.relayprovider"
          }
          impureProvider2: {
            type: "Float!"
            provider: "./provideRandomNumber_invalid2.relayprovider"
          }
        ) {
          profile_picture(scale: $impureProvider1) {
            uri
          }
          other_picture: profile_picture(scale: $impureProvider2) {
            uri
          }
        }
      `;

      const userVariables = {};
      let vars = withProvidedVariables(
        userVariables,
        userQuery.params.providedVariables,
      );
      // first call should return 0
      expect(
        vars.__relay_internal__pv__provideRandomNumber_invalid1relayprovider,
      ).toEqual(0);
      expect(
        vars.__relay_internal__pv__provideRandomNumber_invalid2relayprovider,
      ).toEqual(0);
      expectToWarnMany(
        [
          'Relay: Expected function `get` for provider ' +
            '`__relay_internal__pv__provideRandomNumber_invalid1relayprovider`' +
            ' to be a pure function, but got conflicting return values `1` and `0`',
          'Relay: Expected function `get` for provider ' +
            '`__relay_internal__pv__provideRandomNumber_invalid2relayprovider`' +
            ' to be a pure function, but got conflicting return values `1` and `0`',
        ],
        () => {
          vars = withProvidedVariables(
            userVariables,
            userQuery.params.providedVariables,
          );
        },
      );
      // should use cached value from first call to provider.get()
      expect(
        vars.__relay_internal__pv__provideRandomNumber_invalid1relayprovider,
      ).toEqual(0);
      expect(
        vars.__relay_internal__pv__provideRandomNumber_invalid2relayprovider,
      ).toEqual(0);
    });

    it('warns for different queries that use the same provider function', () => {
      const userQuery = graphql`
        query withProvidedVariablesTest6Query {
          node(id: 4) {
            ...withProvidedVariablesTest6Fragment @dangerously_unaliased_fixme
          }
        }
      `;
      graphql`
        fragment withProvidedVariablesTest6Fragment on User
        @argumentDefinitions(
          impureProvider: {
            type: "Float!"
            provider: "./provideRandomNumber_invalid1.relayprovider"
          }
        ) {
          profile_picture(scale: $impureProvider) {
            uri
          }
        }
      `;

      const userVariables = {};
      let vars;
      expectToWarn(
        'Relay: Expected function `get` for provider ' +
          '`__relay_internal__pv__provideRandomNumber_invalid1relayprovider`' +
          ' to be a pure function, but got conflicting return values `2` and `0`',
        () => {
          vars = withProvidedVariables(
            userVariables,
            userQuery.params.providedVariables,
          );
        },
      );
      // should use cached value from previous test case
      expect(
        vars.__relay_internal__pv__provideRandomNumber_invalid1relayprovider,
      ).toEqual(0);
    });
  });
});
