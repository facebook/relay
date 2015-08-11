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

describe('printRelayQuery', () => {
  var GraphQL;
  var Relay;
  var RelayNodeInterface;
  var RelayQuery;

  var generateRQLFieldAlias;
  var printRelayQuery;

  var {getNode} = RelayTestUtils;

  function trimQuery(str) {
    return str.replace(/\s*(\{|\})\s*/g, '$1').replace(/,\s+/g, ',').trim();
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    GraphQL = require('GraphQL_EXPERIMENTAL');
    Relay = require('Relay');
    RelayNodeInterface = require('RelayNodeInterface');
    RelayQuery = require('RelayQuery');

    generateRQLFieldAlias = require('generateRQLFieldAlias');
    printRelayQuery = require('printRelayQuery');

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
      expect(printRelayQuery(query)).toEqual(trimQuery(`
        query UnknownFile {
          me {
            firstName,
            lastName,
            id
          }
        }
      `));
    });

    it('prints a query with one root argument', () => {
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            name,
          }
        }
      `);
      expect(printRelayQuery(query)).toEqual(trimQuery(`
        query UnknownFile {
          node(id:"123") {
            name,
            id
          }
        }
      `));
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
      expect(printRelayQuery(query)).toEqual(trimQuery(`
        query FooQuery {
          node(id:123) {
            name,
            id
          }
        }
      `));
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
      expect(printRelayQuery(query)).toEqual(trimQuery(`
        query UnknownFile {
          usernames(names:["a","b","c"]) {
            firstName,
            lastName,
            id
          }
        }
      `));
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
      expect(printRelayQuery(query)).toEqual(trimQuery(`
        query FooQuery {
          nodes(ids:[123,456]) {
            name,
            id
          }
        }
      `));
    });

    it('prints enum call values', () => {
      var value = 'WEB';
      var query = getNode(Relay.QL`
        query FooQuery {
          settings(environment: $env) {
            notificationSounds,
          },
        }
      `, {
        env: value
      });
      expect(printRelayQuery(query)).toEqual(trimQuery(`
        query FooQuery {
          settings(environment:WEB) {
            notificationSounds
          }
        }
      `));
    });

    it('prints object call values', () => {
      var value = {query: 'Menlo Park'};
      var query = getNode(Relay.QL`
        query {
          checkinSearchQuery(query: $q) {
            query,
          }
        }
      `, {
        q: value,
      });

      expect(printRelayQuery(query)).toEqual(trimQuery(`
        query UnknownFile {
          checkinSearchQuery(query: {query:"Menlo Park"}) {
            query
          }
        }
      `));
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
      expect(trimQuery(printRelayQuery(query))).toEqual(trimQuery(`
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
      expect(printRelayQuery(fragment)).toEqual(trimQuery(`
        fragment UnknownFile on Viewer {
          actor {
            id
          }
        }
      `));
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
      expect(trimQuery(printRelayQuery(fragment))).toEqual(trimQuery(`
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
      expect(printRelayQuery(fragment)).toEqual(trimQuery(`
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
      expect(printRelayQuery(fragment)).toEqual(trimQuery(`
        fragment UnknownFile on Actor {
          ${alias}:profilePicture(size:["32","64"]) {
            uri
          },
          id
        }
      `));
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
      expect(printRelayQuery(fragment)).toEqual(trimQuery(`
        fragment UnknownFile on Actor {
          ${alias}:profilePicture(size:[32,64]) {
            uri
          },
          id
        }
      `));
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
      expect(printRelayQuery(fragment)).toEqual(trimQuery(`
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
    })

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
      expect(trimQuery(printRelayQuery(fragment))).toEqual(trimQuery(`
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

    expect(printRelayQuery(mutation)).toEqual(trimQuery(`
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
  });
});
