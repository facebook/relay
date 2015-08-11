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

describe('filterRelayQuery()', () => {
  var Relay;
  var RelayQuery;

  var filterRelayQuery;

  var query;

  var {getNode} = RelayTestUtils;

  beforeEach(function() {
    jest.resetModuleRegistry();

    Relay = require('Relay');
    RelayQuery = require('RelayQuery');

    filterRelayQuery = require('filterRelayQuery');

    query = getNode(Relay.QL`
      query {
        viewer {
          newsFeed {
            edges {
              node {
                message {
                  text
                }
              }
            }
          }
        }
      }
    `);

    this.addMatchers(RelayTestUtils.matchers);
  });

  it('returns the original query if nothing is filtered out', () => {
    expect(filterRelayQuery(query, () => true)).toBe(query);
  });

  it('returns null if all nodes are filterout out', () => {
    expect(filterRelayQuery(query, () => false)).toBe(null);
  });

  it('filters specific nodes', () => {
    var filter = function(node) {
      return !(
        node instanceof RelayQuery.Field &&
        node.getSchemaName() === 'text'
      );
    };
    expect(filterRelayQuery(query, filter)).toEqualQueryRoot(getNode(Relay.QL`
      query {
        viewer {
          newsFeed {
            edges {
              cursor,
              node {
                id,
              }
            },
            pageInfo {
              hasNextPage,
              hasPreviousPage
            }
          }
        }
      }
    `));
  });
});
