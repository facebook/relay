/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

require('configureForRelayOSS');

const RelayClassic = require('../../RelayPublic');
const RelayQuery = require('../../query/RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

const filterRelayQuery = require('../filterRelayQuery');

describe('filterRelayQuery()', () => {
  let query;

  const {getNode} = RelayTestUtils;

  beforeEach(function() {
    jest.resetModules();

    query = getNode(
      RelayClassic.QL`
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

    expect.extend(RelayTestUtils.matchers);
  });

  it('returns the original query if nothing is filtered out', () => {
    expect(filterRelayQuery(query, () => true)).toBe(query);
  });

  it('returns null if all nodes are filterout out', () => {
    expect(filterRelayQuery(query, () => false)).toBe(null);
  });

  it('filters specific nodes', () => {
    const filter = function(node) {
      return !(
        node instanceof RelayQuery.Field && node.getSchemaName() === 'text'
      );
    };
    expect(filterRelayQuery(query, filter)).toEqualQueryRoot(
      getNode(
        RelayClassic.QL`
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
