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
const RelayQuery = require('../RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

const createRelayQuery = require('../createRelayQuery');

describe('createRelayQuery', () => {
  beforeEach(() => {
    jest.resetModules();

    expect.extend(RelayTestUtils.matchers);
  });

  it('creates queries from GraphQL', () => {
    const root = createRelayQuery(
      RelayClassic.QL`
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
      },
    );
    expect(root instanceof RelayQuery.Root).toBe(true);
    expect(root.getFieldByStorageKey('newsFeed').getCallsWithValues()).toEqual([
      {name: 'first', type: 'Int', value: 10},
    ]);
  });
});
