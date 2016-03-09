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

const RelayTestUtils = require('RelayTestUtils');

const callsFromGraphQL = require('callsFromGraphQL');
const callsToGraphQL = require('callsToGraphQL');

describe('callsToGraphQL', function() {
  it('converts array calls with null values', () => {
    const relayCalls = [{
      name: 'size',
      value: null,
    }];
    const graphqlCalls = [RelayTestUtils.createCall('size', null)];
    expect(callsFromGraphQL(graphqlCalls)).toEqual(relayCalls);
    expect(callsToGraphQL(relayCalls)).toEqual(graphqlCalls);
  });

  it('converts array calls without values', () => {
    const relayCalls = [{
      name: 'size',
      value: [],
    }];
    const graphqlCalls = [RelayTestUtils.createCall('size', [])];
    expect(callsFromGraphQL(graphqlCalls)).toEqual(relayCalls);
    expect(callsToGraphQL(relayCalls)).toEqual(graphqlCalls);
  });

  it('converts calls with array values', () => {
    const relayCalls = [{
      name: 'size',
      value: [32, 64],
    }];
    const graphqlCalls = [RelayTestUtils.createCall('size', [32, 64])];
    expect(callsFromGraphQL(graphqlCalls)).toEqual(relayCalls);
    expect(callsToGraphQL(relayCalls)).toEqual(graphqlCalls);
  });

  it('converts singular calls with null values', () => {
    const relayCalls = [{
      name: 'size',
      value: 32,
    }];
    const graphqlCalls = [RelayTestUtils.createCall('size', 32)];
    expect(callsFromGraphQL(graphqlCalls)).toEqual(relayCalls);
    expect(callsToGraphQL(relayCalls)).toEqual(graphqlCalls);
  });
});
