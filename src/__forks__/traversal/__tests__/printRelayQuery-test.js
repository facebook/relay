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
var printRelayQuery = require('printRelayQuery');

describe('printRelayQuery', () => {
  var {getNode} = RelayTestUtils;

  function trimQuery(str) {
    return str.replace(/\s*(\{|\})\s*/g, '$1').replace(/,\s+/g, ',').trim();
  }

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
      var {text, variables} = printRelayQuery(query);
      expect(text).toEqual(trimQuery(`
        query UnknownFile {
          me {
            firstName,
            lastName,
            id
          }
        }
      `));
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
      var {text, variables} = printRelayQuery(query);
      expect(text).toEqual(trimQuery(`
        query UnknownFile {
          node(id:"123") {
            name,
            id
          }
        }
      `));
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
      var {text, variables} = printRelayQuery(query);
      expect(text).toEqual(trimQuery(`
        query FooQuery {
          node(id:123) {
            name,
            id
          }
        }
      `));
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
      var {text, variables} = printRelayQuery(query);
      expect(text).toEqual(trimQuery(`
        query UnknownFile {
          usernames(names:["a","b","c"]) {
            firstName,
            lastName,
            id
          }
        }
      `));
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
      var {text, variables} = printRelayQuery(query);
      expect(text).toEqual(trimQuery(`
        query FooQuery {
          nodes(ids:[123,456]) {
            name,
            id
          }
        }
      `));
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
      var {text, variables} = printRelayQuery(query);
      expect(text).toEqual(trimQuery(`
        query FooQuery($environment_0:Environment) {
          settings(environment:$environment_0) {
            notificationSounds
          }
        }
      `));
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

      var {text, variables} = printRelayQuery(query);
      expect(text).toEqual(trimQuery(`
        query UnknownFile($query_0:CheckinSearchInput) {
          checkinSearchQuery(query:$query_0) {
            query
          }
        }
      `));
      expect(variables).toEqual({
        query_0: objectValue,
      });
    });

    it('throws for ref queries', () => {
      var query = RelayQuery.Node.buildRoot(
        RelayNodeInterface.NODE,
        new GraphQL.BatchCallVariable('q0', '$.*.actor.id'),
        [
          RelayQuery.Node.buildField('id'),
          RelayQuery.Node.buildField('name'),
        ],
        {
          isDeferred: true,
          rootArg: RelayNodeInterface.ID,
          type: RelayNodeInterface.NODE_TYPE,
        },
        'RefQueryName'
      );
      expect(() => printRelayQuery(query)).toFailInvariant(
        'printRelayQuery(): Deferred queries are not supported.'
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
      var {text, variables} = printRelayQuery(query);
      expect(trimQuery(text)).toEqual(trimQuery(`
        query UnknownFile {
          node(id:"123") {
            id,
            ...${fragmentID},
            ...${fragmentID}
          }
        }
        fragment ${fragmentID} on User {
          name,
          id
        }
      `));
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
      var {text, variables} = printRelayQuery(fragment);
      expect(text).toEqual(trimQuery(`
        fragment UnknownFile on Viewer {
          actor {
            id
          }
        }
      `));
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
      var {text, variables} = printRelayQuery(fragment);
      expect(trimQuery(text)).toEqual(trimQuery(`
        fragment UnknownFile on Node {
          id,
          ...${fragmentID},
          ...${fragmentID}
        }
        fragment ${fragmentID} on User {
          name,
          id
        }
      `));
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
      var {text, variables} = printRelayQuery(fragment);
      expect(text).toEqual(trimQuery(`
        fragment UnknownFile on Viewer {
          ${alias}:newsFeed(first:10) {
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
          }
        }
      `));
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
      var {text, variables} = printRelayQuery(fragment);
      expect(text).toEqual(trimQuery(`
        fragment UnknownFile on Actor {
          ${alias}:profilePicture(size:["32","64"]) {
            uri
          },
          id
        }
      `));
      expect(variables).toEqual({});
    });

    it('prints a field with multiple variable arguments', () => {
      var alias = generateRQLFieldAlias('profilePicture.size(32,64)');
      var variables = {
        height: 64,
        width: 32,
      };
      var fragment = getNode(Relay.QL`
        fragment on Actor {
          profilePicture(size:[$width,$height]) {
            uri
          }
        }
      `, variables);
      var {text, variables} = printRelayQuery(fragment);
      expect(text).toEqual(trimQuery(`
        fragment UnknownFile on Actor {
          ${alias}:profilePicture(size:[32,64]) {
            uri
          },
          id
        }
      `));
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
      var {text, variables} = printRelayQuery(fragment);
      expect(text).toEqual(trimQuery(`
        fragment UnknownFile on Actor {
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
          id
        }
      `));
      expect(variables).toEqual({});
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
      var {text, variables} = printRelayQuery(fragment);
      expect(trimQuery(text)).toEqual(trimQuery(`
        fragment UnknownFile on Viewer {
          actor {
            id,
            ...${fragmentID},
            ...${fragmentID}
          }
        }
        fragment ${fragmentID} on User {
          name,
          id
        }
      `));
      expect(variables).toEqual({});
    });
  });

  it('prints a mutation', () => {
    var mutation = getNode(Relay.QL`
      mutation {
        feedbackLike(input:$input) {
          clientMutationId,
          feedback {
            id,
            likeSentence,
            likers
          }
        }
      }
    `,
      {input: ''}
    );

    var {text, variables} = printRelayQuery(mutation);
    expect(text).toEqual(trimQuery(`
      mutation UnknownFile($input:FeedbackLikeInput) {
        feedbackLike(input:$input) {
          clientMutationId,
          feedback {
            id,
            likeSentence,
            likers
          }
        }
      }
    `));
    expect(variables).toEqual({});
  });
});
