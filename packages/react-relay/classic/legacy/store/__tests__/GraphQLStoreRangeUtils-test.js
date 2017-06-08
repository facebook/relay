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

const QueryBuilder = require('QueryBuilder');
const GraphQLStoreRangeUtils = require('GraphQLStoreRangeUtils');

describe('GraphQLStoreRangeUtils', () => {
  let rangeData;

  beforeEach(() => {
    rangeData = new GraphQLStoreRangeUtils();
  });

  it('should encode and decode', () => {
    const id = 'client:1';
    const callValues = {count: '1', cursor: '123456'};

    const firstCall = QueryBuilder.createCall(
      'first',
      QueryBuilder.createCallVariable('count'),
    );

    const afterCall = QueryBuilder.createCall(
      'after',
      QueryBuilder.createCallVariable('cursor'),
    );

    const calls = [firstCall, afterCall];

    const rangeID = rangeData.getClientIDForRangeWithID(calls, callValues, id);

    // TODO: This is technically an implementation detail. We shouldn't test
    // the actual value of the string; instead we should just confirm that it's
    // the same given the same id and calls, and that it's different given
    // a different ID or different calls.
    expect(rangeID).toEqual('client:1_first(1),after(123456)');

    const parsed = rangeData.parseRangeClientID(rangeID);
    expect(parsed.dataID).toBe(id);
    expect(parsed.calls).toBe(calls);
    expect(parsed.callValues).toBe(callValues);
  });

  it('removes range data for records', () => {
    const id = 'client:1';
    const calls = [
      QueryBuilder.createCall('first', QueryBuilder.createCallValue(1)),
    ];
    const callValues = {};
    const rangeID = rangeData.getClientIDForRangeWithID(calls, callValues, id);
    expect(rangeData.parseRangeClientID(rangeID)).toEqual({
      dataID: id,
      calls,
      callValues,
    });

    rangeData.removeRecord(id);
    expect(rangeData.parseRangeClientID(rangeID)).toBe(null);
  });
});
