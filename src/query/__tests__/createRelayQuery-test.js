/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

require('configureForRelayOSS');

const Relay = require('Relay');
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

const createRelayQuery = require('createRelayQuery');

describe('createRelayQuery', () => {
  beforeEach(() => {
    jest.resetModules();

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('creates queries from GraphQL', () => {
    const root = createRelayQuery(
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
});
