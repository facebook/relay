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

describe('toGraphQL', function() {
  var GraphQL;
  var Relay;

  var fromGraphQL;
  var splitDeferredRelayQueries;
  var toGraphQL;

  var {defer, getNode} = RelayTestUtils;

  beforeEach(function() {
    jest.resetModuleRegistry();

    GraphQL = require('GraphQL');
    Relay = require('Relay');

    fromGraphQL = require('fromGraphQL');
    splitDeferredRelayQueries = require('splitDeferredRelayQueries');
    toGraphQL = require('toGraphQL');

    jest.addMatchers({
      toConvert(query) {
        var expected = JSON.stringify(query.toJSON());
        var actual = JSON.stringify(
          this.actual(fromGraphQL.Node(query)).toJSON()
        );
        var not = this.isNot ? 'not ' : ' ';
        this.message = () =>
          'Expected ' + expected + not +
          'to equal ' + actual;
        return expected === actual;
      }
    });
  });

  it('converts query', () => {
    expect(toGraphQL.Query).toConvert(Relay.QL`
      query {
        viewer {
          actor {
            id,
            name
          }
        }
      }
    `);
  });

  it('converts query with root args', () => {
    expect(toGraphQL.Query).toConvert(Relay.QL`
      query {
        nodes(ids:["1","2","3"]) {
          id,
          name
        }
      }
    `);
  });

  it('converts fragment', () => {
    expect(toGraphQL.Fragment).toConvert(Relay.QL`
      fragment on Viewer {
        actor {
          id,
          name
        }
      }
    `);
  });

  it('converts field with calls', () => {
    expect(toGraphQL.Query).toConvert(Relay.QL`
      query {
        viewer {
          actor {
            id,
            url(site:"www")
          }
        }
      }
    `);
  });

  it('converts connection and generated fields', () => {
    expect(toGraphQL.Query).toConvert(Relay.QL`
      query {
        viewer {
          actor {
            friends(first:"5") {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      }
    `);
  });

  it('preserves batch call information', () => {
    var fragment = Relay.QL`
      fragment on User {
        name
      }
    `;
    var query = Relay.QL`
      query {
        viewer {
          actor {
            ${defer(fragment)},
          }
        }
      }
    `;
    var splitQueries = splitDeferredRelayQueries(getNode(query));
    var deferredQuery = toGraphQL.Node(splitQueries.deferred[0].required);
    var batchCall = deferredQuery.calls[0].value[0];

    expect(deferredQuery.isDeferred).toBe(true);
    expect(batchCall.sourceQueryID).toBe('q1');
    expect(batchCall.jsonPath).toBe('$.*.actor.id');
  });

  it('does not double-encode argument values', () => {
    var value = {query: 'Menlo Park'};
    var relayQuery = getNode(Relay.QL`
      query {
        checkinSearchQuery(query:$q) {
          query,
        }
      }
    `, {
      q: value,
    });
    expect(relayQuery.getRootCall().value).toEqual(value);
    var convertedQuery = toGraphQL.Query(relayQuery);
    expect(convertedQuery.calls[0].value.callValue).toBe(value);
  });

  it('supports object argument values', () => {
    var value = {query: 'Menlo Park'};
    var relayQuery = getNode(Relay.QL`
      query {
        checkinSearchQuery(query:$q) {
          query,
        }
      }
    `, {
      q: value,
    });
    expect(relayQuery.getRootCall().value).toEqual(value);
    var convertedQuery = toGraphQL.Query(relayQuery);
    expect(convertedQuery.calls[0].value.callValue).toBe(value);
  });

  it('memoizes the GraphQL-query after the first toGraphQL call', () => {
    var query = Relay.QL`
      query {
        viewer {
          actor {
            id,
            name,
          },
        }
      }
    `;
    var relayQuery = fromGraphQL.Node(query);
    var graphql = toGraphQL.Node(relayQuery);
    // GraphQL queries are static and must be traversed once to determine
    // route-specific fragments and variable values
    expect(fromGraphQL.Node(graphql).equals(relayQuery)).toBe(true);
    expect(graphql).not.toBe(query);
    expect(toGraphQL.Node(relayQuery)).toBe(graphql);
  });

  it('creates a new GraphQL-query if the relay query is a clone', () => {
    var query = Relay.QL`
      fragment on StreetAddress {
        city,
        country,
      }
    `;
    var relayQuery = fromGraphQL.Node(query);
    var relayQueryChild = relayQuery.getChildren()[0];
    var clonedRelayQuery = relayQuery.clone([relayQueryChild]);

    // GraphQL queries are static and must be traversed once to determine
    // route-specific fragments and variable values
    var graphql = toGraphQL.Node(clonedRelayQuery);
    expect(fromGraphQL.Node(graphql).equals(clonedRelayQuery)).toBe(true);
    expect(graphql).not.toBe(query);
    expect(toGraphQL.Node(clonedRelayQuery)).toBe(graphql);
  });
});
