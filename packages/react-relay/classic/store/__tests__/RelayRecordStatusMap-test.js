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

const RelayRecordStatusMap = require('RelayRecordStatusMap');

describe('RelayRecordStatusMap', () => {
  it('sets and checks optimistic status correctly', () => {
    let result = 0;
    expect(RelayRecordStatusMap.isOptimisticStatus(result)).toBe(false);
    result = RelayRecordStatusMap.setOptimisticStatus(result, false);
    expect(RelayRecordStatusMap.isOptimisticStatus(result)).toBe(false);
    result = RelayRecordStatusMap.setOptimisticStatus(result, true);
    expect(RelayRecordStatusMap.isOptimisticStatus(result)).toBe(true);
    result = RelayRecordStatusMap.setOptimisticStatus(result, true);
    expect(RelayRecordStatusMap.isOptimisticStatus(result)).toBe(true);
    result = RelayRecordStatusMap.setOptimisticStatus(result, false);
    expect(RelayRecordStatusMap.isOptimisticStatus(result)).toBe(false);
  });
});
