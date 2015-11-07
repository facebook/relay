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

var Relay = require('Relay');
var filterObject = require('filterObject');
var fromGraphQL = require('fromGraphQL');
var splitDeferredRelayQueries = require('splitDeferredRelayQueries');
var toGraphQL = require('toGraphQL');

describe('toGraphQL', function() {
  var {defer, getNode} = RelayTestUtils;

  const CONCRETE_KEYS = {
    alias: true,
    arguments: true,
    calls: true,
    children: true,
    directives: true,
    fieldName: true,
    isDeferred: true,
    jsonPath: true,
    kind: true,
    metadata: true,
    name: true,
    responseType: true,
    sourceQueryID: true,
    type: true,
    value: true,
  };

  function filterGraphQLNode(node) {
    node = filterObject(node, (value, key) => {
      if (!CONCRETE_KEYS[key]) {
        return false;
      }
      return !!value && (!Array.isArray(value) || value.length);
    });
    if (node.calls) {
      node.calls = node.calls.length ?
        node.calls.map(filterGraphQLNode) :
        null;
    }
    if (node.children) {
      node.children = node.children.length ?
        node.children.map(filterGraphQLNode) :
        null;
    }
    if (node.directives) {
      node.directives = node.directives.length ?
        node.directives.map(filterGraphQLNode) :
        null;
    }
    if (node.metadata) {
      node.metadata = filterObject(
        node.metadata,
        value => !!value
      );
    }
    return node;
  }

  beforeEach(function() {
    jest.resetModuleRegistry();

    jest.addMatchers({
      toConvert(query) {
        // This filters out extraneous properties from `GraphQL.*` nodes such as
        // `fields` or `fragments`, and reduces metadata down to compare only
        // truthy values. Once the printer outputs plain values the filter step
        // can be removed or simplified (might want to still filter metadata).
        var expected = filterGraphQLNode(query);
        var actual = filterGraphQLNode(this.actual(getNode(query)));
        expect(actual).toEqual(expected);
        return true;
      },
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
    var deferredQuery = toGraphQL.Query(splitQueries.deferred[0].required);
    var batchCall = deferredQuery.calls[0].value;

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
