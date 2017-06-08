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

const RelayRecord = require('RelayRecord');

describe('RelayRecord', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('checks if a value is a record', () => {
    expect(RelayRecord.isRecord({__dataID__: '123'})).toBe(true);

    expect(RelayRecord.isRecord(null)).toBe(false);
    expect(RelayRecord.isRecord(undefined)).toBe(false);
    expect(RelayRecord.isRecord([])).toBe(false);
    expect(RelayRecord.isRecord({})).toBe(false);

    const deceptiveArray = [];
    deceptiveArray.__dataID__ = '123';
    expect(RelayRecord.isRecord(deceptiveArray)).toBe(false);
  });

  it('checks if a key is for metadata', () => {
    expect(RelayRecord.isMetadataKey('__dataID__')).toBe(true);
    expect(RelayRecord.isMetadataKey('__range__')).toBe(true);

    expect(RelayRecord.isMetadataKey('id')).toBe(false);
    expect(RelayRecord.isMetadataKey('')).toBe(false);
  });
});
