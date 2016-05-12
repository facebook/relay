/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

require('configureForRelayOSS');

const QueryBuilder = require('QueryBuilder');
const Relay = require('Relay');
const RelayNodeInterface = require('RelayNodeInterface');
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

const generateRQLFieldAlias = require('generateRQLFieldAlias');
const printRelayOSSQuery = require('printRelayOSSQuery');

describe('printRelayOSSQuery', () => {
  const {getNode} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();
    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('roots', () => {
    it('prints a query with no root arguments', () => {
      const query = getNode(Relay.QL`
        query {
          me {
            firstName
            lastName
          }
        }
      `);
      const {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query PrintRelayOSSQuery {
          me {
            firstName,
            lastName,
            id
          }
        }
      `);
      expect(variables).toEqual({});
    });

    it('prints a generated query with one root argument', () => {
      const query = RelayQuery.Root.build(
        'FooQuery',
        'node',
        '123',
        [
          RelayQuery.Field.build({
            fieldName: 'id',
            type: 'String',
          }),
        ],
        {
          identifyingArgName: RelayNodeInterface.ID,
          identifyingArgType: RelayNodeInterface.ID_TYPE,
          isAbstract: true,
          isDeferred: false,
          isPlural: false,
        },
        'Node'
      );
      const {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query FooQuery($id_0: ID!) {
          node(id: $id_0) {
            id
          }
        }
      `);
      expect(variables).toEqual({
        id_0: '123',
      });
    });

    it('prints a query with one root argument', () => {
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            name
          }
        }
      `);
      const {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query PrintRelayOSSQuery($id_0: ID!) {
          node(id: $id_0) {
            name,
            id,
            __typename
          }
        }
      `);
      expect(variables).toEqual({
        id_0: '123',
      });
    });

    it('prints a query with one root numeric argument', () => {
      const query = getNode(Relay.QL`
        query FooQuery {
          node(id: 123) {
            name
            id
          }
        }
      `);
      const {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query FooQuery($id_0: ID!) {
          node(id: $id_0) {
            name,
            id,
            __typename
          }
        }
      `);
      expect(variables).toEqual({
        id_0: 123,
      });
    });

    it('prints a query with multiple root arguments', () => {
      const query = getNode(Relay.QL`
        query {
          usernames(names:["a","b","c"]) {
            firstName
            lastName
          }
        }
      `);
      const {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query PrintRelayOSSQuery($names_0: [String!]!) {
          usernames(names: $names_0) {
            firstName,
            lastName,
            id,
            __typename
          }
        }
      `);
      expect(variables).toEqual({
        names_0: ['a', 'b', 'c'],
      });
    });

    it('prints a query with multiple numeric arguments', () => {
      const query = getNode(Relay.QL`
        query FooQuery {
          nodes(ids: [123, 456]) {
            name
            id
          }
        }
      `);
      const {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query FooQuery($ids_0: [ID!]!) {
          nodes(ids: $ids_0) {
            name,
            id,
            __typename
          }
        }
      `);
      expect(variables).toEqual({
        ids_0: [123,456],
      });
    });

    it('prints enum call values', () => {
      const enumValue = 'WEB';
      const query = getNode(Relay.QL`
        query FooQuery {
          settings(environment: $env) {
            notificationSounds
          }
        }
      `, {
        env: enumValue,
      });
      const {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query FooQuery($environment_0: Environment!) {
          settings(environment: $environment_0) {
            notificationSounds
          }
        }
      `);
      expect(variables).toEqual({
        environment_0: enumValue,
      });
    });

    it('prints object call values', () => {
      const objectValue = {query: 'Menlo Park'};
      const query = getNode(Relay.QL`
        query {
          checkinSearchQuery(query: $q) {
            query
          }
        }
      `, {
        q: objectValue,
      });

      const {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query PrintRelayOSSQuery($query_0: CheckinSearchInput!) {
          checkinSearchQuery(query: $query_0) {
            query
          }
        }
      `);
      expect(variables).toEqual({
        query_0: objectValue,
      });
    });

    it('prints literal object call values', () => {
      const query = getNode(Relay.QL`
        query {
          checkinSearchQuery(query: {query: "Menlo Park"}) {
            query
          }
        }
      `);

      const {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query PrintRelayOSSQuery($query_0: CheckinSearchInput!) {
          checkinSearchQuery(query: $query_0) {
            query
          }
        }
      `);
      expect(variables).toEqual({
        query_0: {
          query: 'Menlo Park',
        },
      });
    });

    it('dedupes enum variables', () => {
      const enumValue = 'WEB';
      const query = getNode(Relay.QL`
        query FooQuery {
          defaultSettings {
            env: notifications(environment: $env)
            web: notifications(environment: WEB)
          }
        }
      `, {
        env: enumValue,
      });
      const envAlias =
        generateRQLFieldAlias('notifications.env.environment(WEB)');
      const webAlias =
        generateRQLFieldAlias('notifications.web.environment(WEB)');
      const {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query FooQuery($environment_0: Environment!) {
          defaultSettings {
            ${envAlias}: notifications(environment: $environment_0),
            ${webAlias}: notifications(environment: $environment_0)
          }
        }
      `);
      expect(variables).toEqual({
        environment_0: enumValue,
      });
    });

    it('dedupes object variables', () => {
      const query1 = {query: 'foo'};
      const query2 = {query: 'foo'};
      const query = getNode(Relay.QL`
        query FooQuery {
          node(id: "123") {
            ... on User {
              foo: storySearch(query: $query1) {
                id
              }
              bar: storySearch(query: $query2) {
                id
              }
            }
          }
        }
      `, {
        query1,
        query2,
      });
      const fooAlias =
        generateRQLFieldAlias('storySearch.foo.query({"query":"foo"})');
      const barAlias =
        generateRQLFieldAlias('storySearch.bar.query({"query":"foo"})');
      const {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query FooQuery($id_0: ID!, $query_1: StorySearchInput!) {
          node(id: $id_0) {
            id,
            __typename,
            ...F0
          }
        }
        fragment F0 on User {
          ${fooAlias}: storySearch(query: $query_1) {
            id
          },
          ${barAlias}: storySearch(query: $query_1) {
            id
          },
          id
        }
      `);
      expect(variables).toEqual({
        id_0: '123',
        query_1: query1,
      });
    });

    it('creates distinct variables for values of different types', () => {
      // Relay allows the same variable at both locations, regardless of type:
      const query = getNode(Relay.QL`
        query DistinctVars {
          node(id: "123") {
            ... on User {
              storySearch(query: $query) {id}
              storyCommentSearch(query: $query) {id}
            }
          }
        }
      `, {
        query: {text: 'foo'}
      });
      const storySearchAlias =
        generateRQLFieldAlias('storySearch.query({"text":"foo"})');
      const storyCommentSearchAlias =
        generateRQLFieldAlias('storyCommentSearch.query({"text":"foo"})');
      const {text, variables} = printRelayOSSQuery(query);
      // GraphQL requires that a different variable be used for values of
      // different types:
      expect(text).toEqualPrintedQuery(`
        query DistinctVars(
          $id_0: ID!,
          $query_1: StorySearchInput!,
          $query_2: StoryCommentSearchInput!
        ) {
          node(id: $id_0) {
            id,
            __typename,
            ...F0
          }
        }
        fragment F0 on User {
          ${storySearchAlias}: storySearch(query: $query_1) {
            id
          },
          ${storyCommentSearchAlias}: storyCommentSearch(query: $query_2) {
            id
          },
          id
        }
      `);
      expect(variables).toEqual({
        id_0: '123',
        query_1: {text: 'foo'},
        query_2: {text: 'foo'},
      });
    });

    it('throws for ref queries', () => {
      const query = RelayQuery.Root.build(
        'RefQueryName',
        RelayNodeInterface.NODE,
        QueryBuilder.createBatchCallVariable('q0', '$.*.actor.id'),
        [
          RelayQuery.Field.build({fieldName: 'id', type: 'String'}),
          RelayQuery.Field.build({fieldName: 'name', type: 'String'}),
        ],
        {
          isDeferred: true,
          identifyingArgName: RelayNodeInterface.ID,
          type: RelayNodeInterface.NODE_TYPE,
        }
      );
      expect(() => printRelayOSSQuery(query)).toFailInvariant(
        'printRelayOSSQuery(): Deferred queries are not supported.'
      );
    });
  });

  describe('fragments', () => {
    it('prints fragments', () => {
      const fragment = getNode(Relay.QL`
        fragment on Viewer {
          actor {
            id
          }
        }
      `);
      const {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQueryRelayQL on Viewer {
          actor {
            id,
            __typename
          }
        }
      `);
      expect(variables).toEqual({});
    });

    it('prints inline fragments', () => {
      const fragment = getNode(Relay.QL`
        fragment on Viewer {
          actor {
            id
            ... on User {
              name
            }
            ... on User {
              profilePicture {
                uri
              }
            }
          }
        }
      `);
      const {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQueryRelayQL on Viewer {
          actor {
            id,
            __typename,
            ...F0,
            ...F1
          }
        }
        fragment F0 on User {
          name,
          id
        }
        fragment F1 on User {
          profilePicture {
            uri
          },
          id
        }
      `);
      expect(variables).toEqual({});
    });

    it('prints fragments with incrementing names', () => {
      const fragmentA = Relay.QL`fragment on User { firstName }`;
      const fragmentB = Relay.QL`fragment on User { lastName }`;
      const fragment = getNode(Relay.QL`
        fragment on Node {
          ${fragmentA}
          ${fragmentB}
        }
      `);
      const {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQueryRelayQL on Node {
          id,
          __typename,
          ...F0,
          ...F1
        }
        fragment F0 on User {
          firstName,
          id
        }
        fragment F1 on User {
          lastName,
          id
        }
      `);
      expect(variables).toEqual({});
    });

    it('prints fragments with identical children only once', () => {
      const fragmentA = Relay.QL`fragment on User { name }`;
      const fragmentB = Relay.QL`fragment on User { name }`;
      const fragment = getNode(Relay.QL`
        fragment on Node {
          ${fragmentA}
          ${fragmentB}
        }
      `);
      const {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQueryRelayQL on Node {
          id,
          __typename,
          ...F0
        }
        fragment F0 on User {
          name,
          id
        }
      `);
      expect(variables).toEqual({});
    });

    it('prints fragments with different variables separately', () => {
      const concreteFragment = Relay.QL`
        fragment on User {
          profilePicture(size: [$width, $height]) {
            uri
          }
        }
      `;
      const fragment = getNode(Relay.QL`fragment on User { id }`).clone([
        getNode(concreteFragment, {width: 32, height: 32}),
        getNode(concreteFragment, {width: 64, height: 64}),
      ]);
      const {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQueryRelayQL on User {
          ...F0,
          ...F1
        }
        fragment F0 on User {
          ${generateRQLFieldAlias('profilePicture.size(32,32)')}:
              profilePicture(size: [32, 32]) {
            uri
          },
          id
        }
        fragment F1 on User {
          ${generateRQLFieldAlias('profilePicture.size(64,64)')}:
              profilePicture(size: [64, 64]) {
            uri
          },
          id
        }
      `);
      expect(variables).toEqual({});
    });

    it('prints fragments with different runtime children separately', () => {
      let child;
      child = Relay.QL`fragment on User { name }`;
      const fragmentA = Relay.QL`fragment on User { ${child} }`;
      child = Relay.QL`fragment on User { profilePicture { uri } }`;
      const fragmentB = Relay.QL`fragment on User { ${child} }`;

      const fragment = getNode(Relay.QL`
        fragment on Node {
          ${fragmentA}
          ${fragmentB}
        }
      `);
      const {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQueryRelayQL on Node {
          id,
          __typename,
          ...F1,
          ...F3
        }
        fragment F0 on User {
          name,
          id
        }
        fragment F1 on User {
          id,
          ...F0
        }
        fragment F2 on User {
          profilePicture {
            uri
          },
          id
        }
        fragment F3 on User {
          id,
          ...F2
        }
      `);
      expect(variables).toEqual({});
    });

    it('prints fragments with different IDs but identical output once', () => {
      const concreteFragment = Relay.QL`fragment on User { name }`;
      const fragment = getNode(Relay.QL`fragment on User { id }`).clone([
        getNode(concreteFragment, {value: 123}),
        getNode(concreteFragment, {value: 456}),
      ]);
      const {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQueryRelayQL on User {
          ...F0
        }
        fragment F0 on User {
          name,
          id
        }
      `);
      expect(variables).toEqual({});
    });

    it('omits empty fragments', () => {
      const fragment = getNode(Relay.QL`
        fragment on Viewer {
          actor {
            id
          }
          ... on Viewer {
            actor @include(if: $false) {
              name
            }
          }
        }
      `, {false: false});
      const {text} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQueryRelayQL on Viewer {
          actor {
            id,
            __typename
          }
        }
      `);
    });
  });

  describe('fields', () => {
    it('prints a field with one argument', () => {
      const alias = generateRQLFieldAlias('newsFeed.first(10)');
      const fragment = getNode(Relay.QL`
        fragment on Viewer {
          newsFeed(first:$first) {
            edges {
              node {
                id
              }
            }
          }
        }
      `, {first: 10});
      const {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQueryRelayQL on Viewer {
          ${alias}:newsFeed(first:10) {
            edges {
              node {
                id,
                __typename
              },
              cursor
            },
            pageInfo {
              hasNextPage,
              hasPreviousPage
            }
          }
        }
      `);
      expect(variables).toEqual({});
    });

    it('prints a field with multiple arguments', () => {
      const alias = generateRQLFieldAlias('profilePicture.size(32,64)');
      const fragment = getNode(Relay.QL`
        fragment on Actor {
          profilePicture(size:["32","64"]) {
            uri
          }
        }
      `);
      const {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQueryRelayQL on Actor {
          ${alias}:profilePicture(size:["32","64"]) {
            uri
          },
          id,
          __typename
        }
      `);
      expect(variables).toEqual({});
    });

    it('prints a field with multiple variable arguments', () => {
      const alias = generateRQLFieldAlias('profilePicture.size(32,64)');
      const fragment = getNode(Relay.QL`
        fragment on Actor {
          profilePicture(size:[$width,$height]) {
            uri
          }
        }
      `, {
        height: 64,
        width: 32,
      });
      const {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQueryRelayQL on Actor {
          ${alias}:profilePicture(size:[32,64]) {
            uri
          },
          id,
          __typename
        }
      `);
      expect(variables).toEqual({});
    });

    it('prints scalar arguments', () => {
      const fragment = getNode(Relay.QL`
        fragment on Actor {
          friends(
            first: $first
            orderby: $orderby
            isViewerFriend: $isViewerFriend
          ) {
            edges {
              node {
                id
              }
            }
          }
        }
      `, {
        first: 10,
        orderby: ['name'],
        isViewerFriend: false,
      });
      const alias = fragment.getChildren()[0].getSerializationKey();
      const {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQueryRelayQL on Actor {
          ${alias}:friends(first:10,orderby:["name"],isViewerFriend:false) {
            edges {
              node {
                id
              },
              cursor
            },
            pageInfo {
              hasNextPage,
              hasPreviousPage
            }
          },
          id,
          __typename
        }
      `);
      expect(variables).toEqual({});
    });

    it('prints object call values', () => {
      const enumValue = 'WEB';
      const fragment = Relay.QL`
        fragment on Settings {
          notifications(environment: $env)
        }
      `;
      const query = getNode(Relay.QL`
        query {
          defaultSettings {
            ${fragment}
          }
        }
      `, {
        env: enumValue,
      });
      const alias = generateRQLFieldAlias('notifications.environment(WEB)');
      const {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query PrintRelayOSSQuery($environment_0: Environment!) {
          defaultSettings {
            ...F0
          }
        }
        fragment F0 on Settings {
          ${alias}:notifications(environment: $environment_0)
        }
      `);
      expect(variables).toEqual({
        environment_0: enumValue,
      });
    });

    it('prints inline fragments as references', () => {
      // these fragments have different types and cannot be flattened
      const nestedFragment = Relay.QL`fragment on User { name }`;
      const fragment = getNode(Relay.QL`
        fragment on Viewer {
          actor {
            id
            ${nestedFragment}
            ${nestedFragment}
          }
        }
      `);
      const {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQueryRelayQL on Viewer {
          actor {
            id,
            __typename,
            ...F0
          }
        }
        fragment F0 on User {
          name,
          id
        }
      `);
      expect(variables).toEqual({});
    });
  });

  it('prints a mutation', () => {
    const inputValue = {
      clientMutationId: '123',
      foo: 'bar',
    };
    const mutation = getNode(Relay.QL`
      mutation {
        feedbackLike(input: $input) {
          clientMutationId
          feedback {
            id
            actor {
              profilePicture(preset: SMALL) {
                uri
              }
            }
            likeSentence
            likers
          }
        }
      }
    `, {input: inputValue});

    const alias = generateRQLFieldAlias('profilePicture.preset(SMALL)');
    const {text, variables} = printRelayOSSQuery(mutation);
    expect(text).toEqualPrintedQuery(`
      mutation PrintRelayOSSQuery(
        $input_0: FeedbackLikeInput!,
        $preset_1: PhotoSize!
      ) {
        feedbackLike(input: $input_0) {
          clientMutationId,
          feedback {
            id,
            actor {
              ${alias}: profilePicture(preset: $preset_1) {
                uri
              },
              id,
              __typename
            },
            likeSentence,
            likers
          }
        }
      }
    `);
    expect(variables).toEqual({
      input_0: inputValue,
      preset_1: 'SMALL',
    });
  });

  it('prints directives', () => {
    const params = {cond: true};
    const nestedFragment = Relay.QL`
      fragment on User @include(if: $cond) {
        name @skip(if: $cond)
      }
    `;
    const query = getNode(Relay.QL`
      query {
        node(id: 123) @skip(if: true) {
          ${nestedFragment}
        }
      }
    `, params);
    const {text, variables} = printRelayOSSQuery(query);
    expect(text).toEqualPrintedQuery(`
      query PrintRelayOSSQuery($id_0: ID!) {
        node(id: $id_0) @skip(if: true) {
          id,
          __typename,
          ...F0
        }
      }
      fragment F0 on User @include(if: true) {
        id
      }
    `);
    expect(variables).toEqual({
      id_0: 123,
    });
  });

  it('throws for directives with complex values', () => {
    const params = {data: {foo: 'bar'}};
    const query = getNode(Relay.QL`
      query {
        node(id: 123) @include(if: $data) {
          id
        }
      }
    `, params);
    expect(() => printRelayOSSQuery(query)).toFailInvariant(
      'printRelayOSSQuery(): Relay only supports directives with scalar ' +
      'values (boolean, number, or string), got `if: [object Object]`.'
    );
  });
});
