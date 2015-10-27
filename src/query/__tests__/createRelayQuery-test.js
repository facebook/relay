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
var RelayQuery = require('RelayQuery');

var createRelayQuery = require('createRelayQuery');

describe('createRelayQuery', () => {
  beforeEach(() => {
    jest.resetModuleRegistry();

    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('creates queries from GraphQL', () => {
    var root = createRelayQuery(
      Relay.QL`
        query {
          viewer {
            newsFeed(first: $count) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `,
      {
        count: 10,
      }
    );
    expect(root instanceof RelayQuery.Root).toBe(true);
    expect(root.getFieldByStorageKey('newsFeed').getCallsWithValues()).toEqual(
      [{name: 'first', value: 10}]
    );
  });

  it('creates queries with Relay.Query tag', () => {
    var root = Relay.Query`
      query {
        viewer {
          newsFeed(first: "10") {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    `;
    expect(root instanceof RelayQuery.Root).toBe(true);
    expect(root.getFieldByStorageKey('newsFeed').getCallsWithValues()).toEqual(
      [{name: 'first', value: '10'}]
    );
  });
});
