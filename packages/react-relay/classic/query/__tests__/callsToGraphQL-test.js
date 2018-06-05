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

const RelayTestUtils = require('RelayTestUtils');

const callsFromGraphQL = require('../callsFromGraphQL');
const callsToGraphQL = require('../callsToGraphQL');

describe('callsToGraphQL', function() {
  it('converts array calls with null values', () => {
    const relayCalls = [
      {
        name: 'size',
        type: 'Int',
        value: null,
      },
    ];
    const graphqlCalls = [RelayTestUtils.createCall('size', null, 'Int')];
    expect(callsFromGraphQL(graphqlCalls)).toEqual(relayCalls);
    expect(callsToGraphQL(relayCalls)).toEqual(graphqlCalls);
  });

  it('converts array calls without values', () => {
    const relayCalls = [
      {
        name: 'size',
        type: '[Int]',
        value: [],
      },
    ];
    const graphqlCalls = [RelayTestUtils.createCall('size', [], '[Int]')];
    expect(callsFromGraphQL(graphqlCalls)).toEqual(relayCalls);
    expect(callsToGraphQL(relayCalls)).toEqual(graphqlCalls);
  });

  it('converts calls with array values', () => {
    const relayCalls = [
      {
        name: 'size',
        type: '[Int]',
        value: [32, 64],
      },
    ];
    const graphqlCalls = [RelayTestUtils.createCall('size', [32, 64], '[Int]')];
    expect(callsFromGraphQL(graphqlCalls)).toEqual(relayCalls);
    expect(callsToGraphQL(relayCalls)).toEqual(graphqlCalls);
  });

  it('converts singular calls with null values', () => {
    const relayCalls = [
      {
        name: 'size',
        type: 'Int',
        value: 32,
      },
    ];
    const graphqlCalls = [RelayTestUtils.createCall('size', 32, 'Int')];
    expect(callsFromGraphQL(graphqlCalls)).toEqual(relayCalls);
    expect(callsToGraphQL(relayCalls)).toEqual(graphqlCalls);
  });
});
