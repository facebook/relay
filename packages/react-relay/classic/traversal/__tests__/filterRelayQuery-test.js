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

jest.disableAutomock();

require('configureForRelayOSS');

const Relay = require('Relay');
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

const filterRelayQuery = require('filterRelayQuery');

describe('filterRelayQuery()', () => {
  let query;

  const {getNode} = RelayTestUtils;

  beforeEach(function() {
    jest.resetModules();

    query = getNode(
      Relay.QL`
      query {
        viewer {
          newsFeed(first: 10) {
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
    `,
    );

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('returns the original query if nothing is filtered out', () => {
    expect(filterRelayQuery(query, () => true)).toBe(query);
  });

  it('returns null if all nodes are filterout out', () => {
    expect(filterRelayQuery(query, () => false)).toBe(null);
  });

  it('filters specific nodes', () => {
    const filter = function(node) {
      return !(node instanceof RelayQuery.Field &&
        node.getSchemaName() === 'text');
    };
    expect(filterRelayQuery(query, filter)).toEqualQueryRoot(
      getNode(
        Relay.QL`
      query {
        viewer {
          newsFeed(first: 10) {
            edges {
              cursor
              node {
                id
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      }
    `,
      ),
    );
  });
});
