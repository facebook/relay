/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const {graphql} = require('../../query/GraphQLTag');
const withProvidedVariables = require('../withProvidedVariables');

describe('withProvidedVariables', () => {
  describe('singleProvidedVariable', () => {
    it('can get the correct provider', () => {
      const userQuery = graphql`
        query withProvidedVariablesTest1Query {
          node(id: 4) {
            ...withProvidedVariablesTest1Fragment
          }
        }
      `;
      graphql`
        fragment withProvidedVariablesTest1Fragment on User
        @argumentDefinitions(
          numberOfFriends: {type: "Int!", provider: "../provideNumberOfFriends"}
        ) {
          friends(first: $numberOfFriends) {
            count
          }
        }
      `;

      const userVariables = {};
      const newVariables = withProvidedVariables(
        userVariables,
        userQuery.params,
      );
      expect(
        newVariables.__withProvidedVariablesTest1Fragment__numberOfFriends,
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
              @arguments(includeFriendsCount_: $includeFriendsCount)
          }
        }
      `;
      graphql`
        fragment withProvidedVariablesTest2Fragment on User
        @argumentDefinitions(
          numberOfFriends: {type: "Int!", provider: "../provideNumberOfFriends"}
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
        userQuery.params,
      );
      expect(
        newVariables.__withProvidedVariablesTest2Fragment__numberOfFriends,
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
            ...withProvidedVariablesTest3Fragment
          }
        }
      `;
      graphql`
        fragment withProvidedVariablesTest3Fragment on User
        @argumentDefinitions(
          numberOfFriends: {type: "Int!", provider: "../provideNumberOfFriends"}
          includeName: {
            type: "Boolean!"
            provider: "../provideIncludeUserNames"
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
        userQuery.params,
      );
      expect(
        newVariables.__withProvidedVariablesTest3Fragment__numberOfFriends,
      ).toEqual(15.0);
      expect(
        newVariables.__withProvidedVariablesTest3Fragment__includeName,
      ).toEqual(true);
      expect(Object.keys(newVariables).length).toEqual(2);
    });
  });

  describe('multipleFragmentsProvidedVariables', () => {
    it('can get the correct provider', () => {
      const userQuery = graphql`
        query withProvidedVariablesTest4Query {
          node(id: 4) {
            ...withProvidedVariablesTest4Fragment1
            ...withProvidedVariablesTest4Fragment2
          }
        }
      `;
      graphql`
        fragment withProvidedVariablesTest4Fragment1 on User
        @argumentDefinitions(
          numberOfFriends: {type: "Int!", provider: "../provideNumberOfFriends"}
          includeName: {
            type: "Boolean!"
            provider: "../provideIncludeUserNames"
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
            provider: "../provideIncludeUserNames"
          }
        ) {
          name @include(if: $includeName)
        }
      `;

      const userVariables = {};
      const newVariables = withProvidedVariables(
        userVariables,
        userQuery.params,
      );
      expect(
        newVariables.__withProvidedVariablesTest4Fragment1__numberOfFriends,
      ).toEqual(15.0);
      expect(
        newVariables.__withProvidedVariablesTest4Fragment1__includeName,
      ).toEqual(true);
      expect(
        newVariables.__withProvidedVariablesTest4Fragment2__includeName,
      ).toEqual(true);
      expect(Object.keys(newVariables).length).toEqual(3);
    });
  });
});
