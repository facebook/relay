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

require('RelayTestUtils').unmockRelay();

jest
  .dontMock('GraphQLStoreRangeUtils');

var QueryBuilder = require('QueryBuilder');
var GraphQLStoreRangeUtils = require('GraphQLStoreRangeUtils');

describe('GraphQLStoreRangeUtils', () => {
  var rangeData;

  beforeEach(() => {
    rangeData = new GraphQLStoreRangeUtils();
  });

  it('should encode and decode', () => {
    var id = 'client:1';
    var callValues = {count: '1', cursor: '123456'};

    var firstCall = QueryBuilder.createCall(
      'first',
      QueryBuilder.createCallVariable('count')
    );

    var afterCall = QueryBuilder.createCall(
      'after',
      QueryBuilder.createCallVariable('cursor')
    );

    var calls = [firstCall, afterCall];

    var rangeID = rangeData.getClientIDForRangeWithID(
      calls,
      callValues,
      id
    );

    // TODO: This is technically an implementation detail. We shouldn't test
    // the actual value of the string; instead we should just confirm that it's
    // the same given the same id and calls, and that it's different given
    // a different ID or different calls.
    expect(rangeID).toEqual('client:1_first(1),after(123456)');

    var parsed = rangeData.parseRangeClientID(rangeID);
    expect(parsed.dataID).toBe(id);
    expect(parsed.calls).toBe(calls);
    expect(parsed.callValues).toBe(callValues);
  });

});
