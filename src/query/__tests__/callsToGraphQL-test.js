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

describe('callsToGraphQL', function() {
  var GraphQL;

  var callsFromGraphQL;
  var callsToGraphQL;

  beforeEach(() => {
    GraphQL = require('GraphQL_EXPERIMENTAL');

    callsFromGraphQL = require('callsFromGraphQL');
    callsToGraphQL = require('callsToGraphQL');
  });

  it('converts array calls with null values', () => {
    var relayCalls = [{
      name: 'size',
      value: null
    }];
    var graphqlCalls = [new GraphQL.Callv('size', null)];
    expect(callsFromGraphQL(graphqlCalls)).toEqual(relayCalls);
    expect(callsToGraphQL(relayCalls)).toEqual(graphqlCalls);
  });

  it('converts array calls without values', () => {
    var relayCalls = [{
      name: 'size',
      value: []
    }];
    var graphqlCalls = [new GraphQL.Callv('size', [])];
    expect(callsFromGraphQL(graphqlCalls)).toEqual(relayCalls);
    expect(callsToGraphQL(relayCalls)).toEqual(graphqlCalls);
  });

  it('converts calls with array values', () => {
    var relayCalls = [{
      name: 'size',
      value: [32, 64]
    }];
    var graphqlCalls = [new GraphQL.Callv('size', [32, 64])];
    expect(callsFromGraphQL(graphqlCalls)).toEqual(relayCalls);
    expect(callsToGraphQL(relayCalls)).toEqual(graphqlCalls);
  });

  it('converts singular calls with null values', () => {
    var relayCalls = [{
      name: 'size',
      value: 32
    }];
    var graphqlCalls = [new GraphQL.Callv('size', 32)];
    expect(callsFromGraphQL(graphqlCalls)).toEqual(relayCalls);
    expect(callsToGraphQL(relayCalls)).toEqual(graphqlCalls);
  });
});
