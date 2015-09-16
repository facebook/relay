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

  function trimQuery(str) {
    return str
      .replace(/\s*(\{|\})\s*/g, '$1')
      .replace(/,\s+/g, ',')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
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
      var {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqual(trimQuery(`
        query PrintRelayOSSQuery {
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
      var {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqual(trimQuery(`
        query PrintRelayOSSQuery {
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
      var {text, variables} = printRelayOSSQuery(query);
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
      var {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqual(trimQuery(`
        query PrintRelayOSSQuery {
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
      var {text, variables} = printRelayOSSQuery(query);
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
      var {text, variables} = printRelayOSSQuery(query);
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

      var {text, variables} = printRelayOSSQuery(query);
      expect(text).toEqual(trimQuery(`
        query PrintRelayOSSQuery($query_0:CheckinSearchInput) {
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
      expect(trimQuery(text)).toEqual(trimQuery(`
        query PrintRelayOSSQuery {
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
      var {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqual(trimQuery(`
        fragment PrintRelayOSSQuery on Viewer {
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
      var {text, variables} = printRelayOSSQuery(fragment);
      expect(trimQuery(text)).toEqual(trimQuery(`
        fragment PrintRelayOSSQuery on Node {
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
      var {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqual(trimQuery(`
        fragment PrintRelayOSSQuery on Viewer {
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
      var {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqual(trimQuery(`
        fragment PrintRelayOSSQuery on Actor {
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
      var {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqual(trimQuery(`
        fragment PrintRelayOSSQuery on Actor {
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
      var {text, variables} = printRelayOSSQuery(fragment);
      expect(text).toEqual(trimQuery(`
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
          id
        }
      `));
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
      expect(trimQuery(text)).toEqual(trimQuery(`
        query PrintRelayOSSQuery($environment_0:Environment) {
          defaultSettings {
            ...${fragmentID}
          }
        }
        fragment ${fragmentID} on Settings {
          ${alias}:notifications(environment:$environment_0)
        }
      `));
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
      expect(trimQuery(text)).toEqual(trimQuery(`
        fragment PrintRelayOSSQuery on Viewer {
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

    var {text, variables} = printRelayOSSQuery(mutation);
    expect(text).toEqual(trimQuery(`
      mutation PrintRelayOSSQuery($input:FeedbackLikeInput) {
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

  it('prints directives', () => {
    var params = {cond: true};
    var nestedFragment = Relay.QL`
      fragment on User
        @include(if: $cond)
        @foo(int: 10, bool: true, str: "string")
      {
        name @skip(if: $cond)
      }
    `;
    var query = getNode(Relay.QL`
      query {
        node(id: 123) @source(uri: "facebook.com") {
          ${nestedFragment}
        }
      }
    `, params);
    var fragmentID = getNode(nestedFragment, params).getFragmentID();
    var {text, variables} = printRelayOSSQuery(query);
    expect(trimQuery(text)).toEqual(trimQuery(`
      query PrintRelayOSSQuery {
        node(id:123) @source(uri:"facebook.com") {
          id,
          ...${fragmentID}
        }
      }
      fragment ${fragmentID} on User
        @include(if:true)
        @foo(int:10, bool:true, str:"string")
      {
        name @skip(if:true),
        id
      }
    `));
    expect(variables).toEqual({});
  });

  it('throws for directives with complex values', () => {
    var params = {data: {foo: 'bar'}};
    var query = getNode(Relay.QL`
      query {
        node(id: 123) @meta(data: $data) {
          id
        }
      }
    `, params);
    expect(() => printRelayOSSQuery(query)).toFailInvariant(
      'printRelayOSSQuery(): Relay only supports directives with scalar ' +
      'values (boolean, number, or string), got `data: [object Object]`.'
    );
  });
});
