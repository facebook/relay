/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

var RelayTestUtils = require('RelayTestUtils');
RelayTestUtils.unmockRelay();

var GraphQL = require('GraphQL');
var Relay = require('Relay');
var RelayNodeInterface = require('RelayNodeInterface');
var RelayQuery = require('RelayQuery');
var generateRQLFieldAlias = require('generateRQLFieldAlias');
var printRelayOSSQuery = require('printRelayOSSQuery');

describe('printRelayOSSQuery', () => {
  var {getNode} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    jest.addMatchers(RelayTestUtils.matchers);
  });

  describe('roots', () => {
    it('prints a query with no root arguments', () => {
      var query = getNode(Relay.QL`
        query {
          me {
            firstName,
            lastName,
          }
        }
      `);
      var {text, variables} = printRelayOSSQuery(query);
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

    it('prints a query with one root argument', () => {
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            name,
          }
        }
      `);
      var {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query PrintRelayOSSQuery {
          node(id:"123") {
            name,
            id,
            __typename
          }
        }
      `);
      expect(variables).toEqual({});
    });

    it('prints a query with one root numeric argument', () => {
      var query = getNode(Relay.QL`
        query FooQuery {
          node(id: 123) {
            name,
            id,
          },
        }
      `);
      var {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query FooQuery {
          node(id:123) {
            name,
            id,
            __typename
          }
        }
      `);
      expect(variables).toEqual({});
    });

    it('prints a query with multiple root arguments', () => {
      var query = getNode(Relay.QL`
        query {
          usernames(names:["a","b","c"]) {
            firstName,
            lastName,
          }
        }
      `);
      var {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query PrintRelayOSSQuery {
          usernames(names:["a","b","c"]) {
            firstName,
            lastName,
            id,
            __typename
          }
        }
      `);
      expect(variables).toEqual({});
    });

    it('prints a query with multiple numeric arguments', () => {
      var query = getNode(Relay.QL`
        query FooQuery {
          nodes(ids: [123, 456]) {
            name,
            id,
          }
        }
      `);
      var {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query FooQuery {
          nodes(ids:[123,456]) {
            name,
            id,
            __typename
          }
        }
      `);
      expect(variables).toEqual({});
    });

    it('prints enum call values', () => {
      var enumValue = 'WEB';
      var query = getNode(Relay.QL`
        query FooQuery {
          settings(environment: $env) {
            notificationSounds,
          },
        }
      `, {
        env: enumValue
      });
      var {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query FooQuery($environment_0:Environment) {
          settings(environment:$environment_0) {
            notificationSounds
          }
        }
      `);
      expect(variables).toEqual({
        environment_0: enumValue,
      });
    });

    it('prints object call values', () => {
      var objectValue = {query: 'Menlo Park'};
      var query = getNode(Relay.QL`
        query {
          checkinSearchQuery(query: $q) {
            query,
          }
        }
      `, {
        q: objectValue,
      });

      var {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query PrintRelayOSSQuery($query_0:CheckinSearchInput) {
          checkinSearchQuery(query:$query_0) {
            query
          }
        }
      `);
      expect(variables).toEqual({
        query_0: objectValue,
      });
    });

    it('throws for ref queries', () => {
      var query = RelayQuery.Root.build(
        RelayNodeInterface.NODE,
        new GraphQL.BatchCallVariable('q0', '$.*.actor.id'),
        [
          RelayQuery.Field.build('id'),
          RelayQuery.Field.build('name'),
        ],
        {
          isDeferred: true,
          identifyingArgName: RelayNodeInterface.ID,
          type: RelayNodeInterface.NODE_TYPE,
        },
        'RefQueryName'
      );
      expect(() => printRelayOSSQuery(query)).toFailInvariant(
        'printRelayOSSQuery(): Deferred queries are not supported.'
      );
    });

    it('prints inline fragments as references', () => {
      // the fragment has a different type than the containing field and cannot
      // be flattened (User !== Node)
      var fragment = Relay.QL`fragment on User{name}`;
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            ${fragment},
            ${fragment},
          }
        }
      `);
      var fragmentID = getNode(fragment).getFragmentID();
      var {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query PrintRelayOSSQuery {
          node(id:"123") {
            id,
            __typename,
            ...${fragmentID},
            ...${fragmentID}
          }
        }
        fragment ${fragmentID} on User {
          name,
          id
        }
      `);
      expect(variables).toEqual({});
    });
  });

  describe('fragments', () => {
    it('prints fragments', () => {
      var fragment = getNode(Relay.QL`
        fragment on Viewer {
          actor {
            id,
          },
        }
      `);
      var {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQuery on Viewer {
          actor {
            id,
            __typename
          }
        }
      `);
      expect(variables).toEqual({});
    });

    it('prints inline fragments as references', () => {
      // these fragments have different types and cannot be flattened
      var nestedFragment = Relay.QL`fragment on User{name}`;
      var fragment = getNode(Relay.QL`
        fragment on Node {
          ${nestedFragment},
          ${nestedFragment},
        }
      `);
      var fragmentID = getNode(nestedFragment).getFragmentID();
      var {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQuery on Node {
          id,
          __typename,
          ...${fragmentID},
          ...${fragmentID}
        }
        fragment ${fragmentID} on User {
          name,
          id
        }
      `);
      expect(variables).toEqual({});
    });
  });

  describe('fields', () => {
    it('prints a field with one argument', () => {
      var alias = generateRQLFieldAlias('newsFeed.first(10)');
      var fragment = getNode(Relay.QL`
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
      var {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQuery on Viewer {
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
      var alias = generateRQLFieldAlias('profilePicture.size(32,64)');
      var fragment = getNode(Relay.QL`
        fragment on Actor {
          profilePicture(size:["32","64"]) {
            uri
          }
        }
      `);
      var {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQuery on Actor {
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
      var alias = generateRQLFieldAlias('profilePicture.size(32,64)');
      var fragment = getNode(Relay.QL`
        fragment on Actor {
          profilePicture(size:[$width,$height]) {
            uri
          }
        }
      `, {
        height: 64,
        width: 32,
      });
      var {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQuery on Actor {
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
      var fragment = getNode(Relay.QL`
        fragment on Actor {
          friends(
            first: $first,
            orderby: $orderby,
            isViewerFriend: $isViewerFriend,
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
      var alias = fragment.getChildren()[0].getSerializationKey();
      var {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQuery on Actor {
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
      var enumValue = 'WEB';
      var fragment = Relay.QL`
        fragment on Settings {
          notifications(environment: $env)
        }
      `;
      var query = getNode(Relay.QL`
        query {
          defaultSettings {
            ${fragment},
          }
        }
      `, {
        env: enumValue,
      });
      var fragmentID = getNode(fragment, {env: enumValue}).getFragmentID();
      var alias = generateRQLFieldAlias('notifications.environment(WEB)');
      var {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqualPrintedQuery(`
        query PrintRelayOSSQuery($environment_0:Environment) {
          defaultSettings {
            ...${fragmentID}
          }
        }
        fragment ${fragmentID} on Settings {
          ${alias}:notifications(environment:$environment_0)
        }
      `);
      expect(variables).toEqual({
        environment_0: enumValue,
      });
    });

    it('prints inline fragments as references', () => {
      // these fragments have different types and cannot be flattened
      var nestedFragment = Relay.QL`fragment on User{name}`;
      var fragment = getNode(Relay.QL`
        fragment on Viewer {
          actor {
            id,
            ${nestedFragment},
            ${nestedFragment},
          }
        }
      `);
      var fragmentID = getNode(nestedFragment).getFragmentID();
      var {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqualPrintedQuery(`
        fragment PrintRelayOSSQuery on Viewer {
          actor {
            id,
            __typename,
            ...${fragmentID},
            ...${fragmentID}
          }
        }
        fragment ${fragmentID} on User {
          name,
          id
        }
      `);
      expect(variables).toEqual({});
    });
  });

  it('prints a mutation', () => {
    var inputValue = {
      clientMutationId: '123',
      foo: 'bar',
    };
    var mutation = getNode(Relay.QL`
      mutation {
        feedbackLike(input:$input) {
          clientMutationId,
          feedback {
            id,
            actor {
              profilePicture(preset: SMALL) {
                uri,
              },
            },
            likeSentence,
            likers,
          },
        },
      }
    `, {input: inputValue});

    var alias = generateRQLFieldAlias('profilePicture.preset(SMALL)');
    var {text, variables} = printRelayOSSQuery(mutation);
    expect(text).toEqualPrintedQuery(`
      mutation PrintRelayOSSQuery(
        $input_0: FeedbackLikeInput,
        $preset_1: PhotoSize
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
    var params = {cond: true};
    var nestedFragment = Relay.QL`
      fragment on User @include(if: $cond) {
        name @skip(if: $cond)
      }
    `;
    var query = getNode(Relay.QL`
      query {
        node(id: 123) @skip(if: true) {
          ${nestedFragment}
        }
      }
    `, params);
    var fragmentID = getNode(nestedFragment, params).getFragmentID();
    var {text, variables} = printRelayOSSQuery(query);
    expect(text).toEqualPrintedQuery(`
      query PrintRelayOSSQuery {
        node(id: 123) @skip(if: true) {
          id,
          __typename,
          ...${fragmentID}
        }
      }
      fragment ${fragmentID} on User @include(if: true) {
        name @skip(if: true),
        id
      }
    `);
    expect(variables).toEqual({});
  });

  it('throws for directives with complex values', () => {
    var params = {data: {foo: 'bar'}};
    var query = getNode(Relay.QL`
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
