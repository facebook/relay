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

var RelayRecordStatusMap = require('RelayRecordStatusMap');

describe('RelayRecordStatusMap', () => {
  it('sets and checks optimistic status correctly', () => {
    var result = 0;
    expect(RelayRecordStatusMap.isOptimisticStatus(result)).toBe(false);
    result = RelayRecordStatusMap.setOptimisticStatus(
      result,
      false
    );
    expect(RelayRecordStatusMap.isOptimisticStatus(result)).toBe(false);
    result = RelayRecordStatusMap.setOptimisticStatus(
      result,
      true
    );
    expect(RelayRecordStatusMap.isOptimisticStatus(result)).toBe(true);
    result = RelayRecordStatusMap.setOptimisticStatus(
      result,
      true
    );
    expect(RelayRecordStatusMap.isOptimisticStatus(result)).toBe(true);
    result = RelayRecordStatusMap.setOptimisticStatus(
      result,
      false
    );
    expect(RelayRecordStatusMap.isOptimisticStatus(result)).toBe(false);
  });

  it('sets and checks error status correctly', () => {
    var result = 0;
    expect(RelayRecordStatusMap.isErrorStatus(result)).toBe(false);
    result = RelayRecordStatusMap.setErrorStatus(
      result,
      false
    );
    expect(RelayRecordStatusMap.isErrorStatus(result)).toBe(false);
    result = RelayRecordStatusMap.setErrorStatus(
      result,
      true
    );
    expect(RelayRecordStatusMap.isErrorStatus(result)).toBe(true);
    result = RelayRecordStatusMap.setErrorStatus(
      result,
      true
    );
    expect(RelayRecordStatusMap.isErrorStatus(result)).toBe(true);
    result = RelayRecordStatusMap.setErrorStatus(
      result,
      false
    );
    expect(RelayRecordStatusMap.isErrorStatus(result)).toBe(false);
  });

});
