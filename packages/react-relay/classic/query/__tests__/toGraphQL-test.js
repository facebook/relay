/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

jest.enableAutomock();

require('configureForRelayOSS');

const Relay = require('Relay');
const RelayTestUtils = require('RelayTestUtils');

const filterObject = require('filterObject');
const splitDeferredRelayQueries = require('splitDeferredRelayQueries');
const toGraphQL = require('toGraphQL');

describe('toGraphQL', function() {
  const {defer, getNode} = RelayTestUtils;

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
      node.calls = node.calls.length ? node.calls.map(filterGraphQLNode) : null;
    }
    if (node.children) {
      node.children = node.children.length
        ? node.children.map(filterGraphQLNode)
        : null;
    }
    if (node.directives) {
      node.directives = node.directives.length
        ? node.directives.map(filterGraphQLNode)
        : null;
    }
    if (node.metadata) {
      node.metadata = filterObject(node.metadata, value => !!value);
    }
    return node;
  }

  beforeEach(function() {
    jest.resetModules();

    expect.extend({
      toConvert(actual, query) {
        // This filters out extraneous properties from `GraphQL.*` nodes
        // such as `fields` or `fragments`, and reduces metadata down to
        // compare only truthy values. Once the printer outputs plain values
        // the filter step can be removed or simplified (might want to still
        // filter metadata).
        const expected = filterGraphQLNode(query);
        expect(filterGraphQLNode(actual(getNode(query)))).toEqual(expected);
        return {
          pass: true,
        };
      },
    });
  });

  it('converts query', () => {
    expect(toGraphQL.Query).toConvert(
      Relay.QL`
      query {
        viewer {
          actor {
            id
            name
          }
        }
      }
    `,
    );
  });

  it('converts query with root args', () => {
    expect(toGraphQL.Query).toConvert(
      Relay.QL`
      query {
        nodes(ids:["1","2","3"]) {
          id
          name
        }
      }
    `,
    );
  });

  it('converts fragment', () => {
    expect(toGraphQL.Fragment).toConvert(
      Relay.QL`
      fragment on Viewer {
        actor {
          id
          name
        }
      }
    `,
    );
  });

  it('converts field with calls', () => {
    expect(toGraphQL.Query).toConvert(
      Relay.QL`
      query {
        viewer {
          actor {
            id
            url(site:"www")
          }
        }
      }
    `,
    );
  });

  it('converts connection and generated fields', () => {
    expect(toGraphQL.Query).toConvert(
      Relay.QL`
      query {
        viewer {
          actor {
            friends(first: 5) {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      }
    `,
    );
  });

  it('preserves batch call information', () => {
    const fragment = Relay.QL`
      fragment on User {
        name
      }
    `;
    const query = Relay.QL`
      query {
        viewer {
          actor {
            ${defer(fragment)}
          }
        }
      }
    `;
    const splitQueries = splitDeferredRelayQueries(getNode(query));
    const deferredQuery = toGraphQL.Query(splitQueries.deferred[0].required);
    const batchCall = deferredQuery.calls[0].value;

    expect(deferredQuery.isDeferred).toBe(true);
    expect(batchCall.sourceQueryID).toBe('q1');
    expect(batchCall.jsonPath).toBe('$.*.actor.id');
  });

  it('does not double-encode argument values', () => {
    const value = {query: 'Menlo Park'};
    const relayQuery = getNode(
      Relay.QL`
      query {
        checkinSearchQuery(query:$q) {
          query
        }
      }
    `,
      {
        q: value,
      },
    );
    const identifyingArg = relayQuery.getIdentifyingArg();
    expect(identifyingArg).toBeDefined();
    expect(identifyingArg.value).toEqual(value);
    const convertedQuery = toGraphQL.Query(relayQuery);
    expect(convertedQuery.calls[0].value.callValue).toBe(value);
  });
});
