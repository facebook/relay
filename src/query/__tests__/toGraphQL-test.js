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
var fromGraphQL = require('fromGraphQL');
var splitDeferredRelayQueries = require('splitDeferredRelayQueries');
var toGraphQL = require('toGraphQL');

describe('toGraphQL', function() {
  var {defer, getNode} = RelayTestUtils;

  beforeEach(function() {
    jest.resetModuleRegistry();

    jest.addMatchers({
      toConvert(query) {
        var expected = JSON.stringify(query.toJSON());
        var node = this.actual(
          query instanceof GraphQL.Query ?
          fromGraphQL.Query(query) :
          fromGraphQL.Fragment(query)
        );
        var actual = JSON.stringify(node);
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
    const identifyingArg = relayQuery.getIdentifyingArg();
    expect(identifyingArg).toBeDefined();
    expect(identifyingArg.value).toEqual(value);
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
    const identifyingArg = relayQuery.getIdentifyingArg();
    expect(identifyingArg).toBeDefined();
    expect(identifyingArg.value).toEqual(value);
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
    var relayQuery = fromGraphQL.Query(query);
    var graphql = toGraphQL.Query(relayQuery);
    // GraphQL queries are static and must be traversed once to determine
    // route-specific fragments and variable values
    expect(fromGraphQL.Query(graphql).equals(relayQuery)).toBe(true);
    expect(graphql).not.toBe(query);
    expect(toGraphQL.Query(relayQuery)).toBe(graphql);
  });

  it('creates a new GraphQL-query if the relay query is a clone', () => {
    var fragment = Relay.QL`
      fragment on StreetAddress {
        city,
        country,
      }
    `;
    var relayFragment = fromGraphQL.Fragment(fragment);
    var relayFragmentChild = relayFragment.getChildren()[0];
    var clonedRelayFragment = relayFragment.clone([relayFragmentChild]);

    // GraphQL queries are static and must be traversed once to determine
    // route-specific fragments and variable values
    var graphql = toGraphQL.Fragment(clonedRelayFragment);
    expect(fromGraphQL.Fragment(graphql).equals(clonedRelayFragment))
      .toBe(true);
    expect(graphql).not.toBe(fragment);
    expect(toGraphQL.Fragment(clonedRelayFragment)).toBe(graphql);
  });
});
