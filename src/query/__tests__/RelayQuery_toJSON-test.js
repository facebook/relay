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

describe('RelayQuery.toJSON', function() {
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
      toBeConverted() {
        // This filters out extraneous properties from `GraphQL.*` nodes such as
        // `fields` or `fragments`, and reduces metadata down to compare only
        // truthy values. Once the printer outputs plain values the filter step
        // can be removed or simplified (might want to still filter metadata).
        var query = this.actual;
        var expected = filterGraphQLNode(query);
        var actual = filterGraphQLNode(getNode(query).toJSON());
        expect(actual).toEqual(expected);
        return true;
      },
    });
  });

  it('converts query', () => {
    expect(Relay.QL`
      query {
        viewer {
          actor {
            id,
            name
          }
        }
      }
    `).toBeConverted();
  });

  it('converts query with root args', () => {
    expect(Relay.QL`
      query {
        nodes(ids:["1","2","3"]) {
          id,
          name
        }
      }
    `).toBeConverted();
  });

  it('converts fragment', () => {
    expect(Relay.QL`
      fragment on Viewer {
        actor {
          id,
          name
        }
      }
    `).toBeConverted();
  });

  it('converts field with calls', () => {
    expect(Relay.QL`
      query {
        viewer {
          actor {
            id,
            url(site:"www")
          }
        }
      }
    `).toBeConverted();
  });

  it('converts connection and generated fields', () => {
    expect(Relay.QL`
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
    `).toBeConverted();
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
    var deferredQuery = splitQueries.deferred[0].required.toJSON();
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
    var convertedQuery = relayQuery.toJSON();
    expect(convertedQuery.calls[0].value.callValue).toBe(value);
  });
});
