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
const getAllRootVariables = require('../getAllRootVariables');

describe('getAllRootVariables', () => {
  describe('singleProvidedVariable', () => {
    it('can get the correct provider', () => {
      const userQuery = graphql`
        query getAllRootVariablesTest1Query {
          node(id: 4) {
            ...getAllRootVariablesTest1Fragment
          }
        }
      `;
      graphql`
        fragment getAllRootVariablesTest1Fragment on User
        @argumentDefinitions(
          numberOfFriends: {type: "Int!", provider: "../provideNumberOfFriends"}
        ) {
          friends(first: $numberOfFriends) {
            count
          }
        }
      `;

      const userVariables = {};
      const newVariables = getAllRootVariables(userVariables, userQuery.params);
      expect(
        newVariables.__getAllRootVariablesTest1Fragment__numberOfFriends,
      ).toEqual(15.0);
      expect(Object.keys(newVariables).length).toEqual(1);
    });
  });

  describe('singleProvidedVariableWithUserSuppliedVariable', () => {
    it('can get the correct provider and keeps user supplied variables', () => {
      const userQuery = graphql`
        query getAllRootVariablesTest2Query($includeFriendsCount: Boolean!) {
          node(id: 4) {
            ...getAllRootVariablesTest2Fragment
              @arguments(includeFriendsCount_: $includeFriendsCount)
          }
        }
      `;
      graphql`
        fragment getAllRootVariablesTest2Fragment on User
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
      const newVariables = getAllRootVariables(userVariables, userQuery.params);
      expect(
        newVariables.__getAllRootVariablesTest2Fragment__numberOfFriends,
      ).toEqual(15.0);
      expect(newVariables.includeFriendsCount).toEqual(true);
      expect(Object.keys(newVariables).length).toEqual(2);
    });
  });

  describe('multipleProvidedVariables', () => {
    it('can get the correct provider', () => {
      const userQuery = graphql`
        query getAllRootVariablesTest3Query {
          node(id: 4) {
            ...getAllRootVariablesTest3Fragment
          }
        }
      `;
      graphql`
        fragment getAllRootVariablesTest3Fragment on User
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
      const newVariables = getAllRootVariables(userVariables, userQuery.params);
      expect(
        newVariables.__getAllRootVariablesTest3Fragment__numberOfFriends,
      ).toEqual(15.0);
      expect(
        newVariables.__getAllRootVariablesTest3Fragment__includeName,
      ).toEqual(true);
      expect(Object.keys(newVariables).length).toEqual(2);
    });
  });

  describe('multipleFragmentsProvidedVariables', () => {
    it('can get the correct provider', () => {
      const userQuery = graphql`
        query getAllRootVariablesTest4Query {
          node(id: 4) {
            ...getAllRootVariablesTest4Fragment1
            ...getAllRootVariablesTest4Fragment2
          }
        }
      `;
      graphql`
        fragment getAllRootVariablesTest4Fragment1 on User
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
        fragment getAllRootVariablesTest4Fragment2 on User
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
      const newVariables = getAllRootVariables(userVariables, userQuery.params);
      expect(
        newVariables.__getAllRootVariablesTest4Fragment1__numberOfFriends,
      ).toEqual(15.0);
      expect(
        newVariables.__getAllRootVariablesTest4Fragment1__includeName,
      ).toEqual(true);
      expect(
        newVariables.__getAllRootVariablesTest4Fragment2__includeName,
      ).toEqual(true);
      expect(Object.keys(newVariables).length).toEqual(3);
    });
  });
});
