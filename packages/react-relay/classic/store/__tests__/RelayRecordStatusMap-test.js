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

const RelayRecordStatusMap = require('../RelayRecordStatusMap');

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
