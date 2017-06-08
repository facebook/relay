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

const rangeOperationToMetadataKey = require('rangeOperationToMetadataKey');

describe('rangeOperationToMetadataKey', () => {
  it('maps from developer-friendly name to internal metadata key name', () => {
    expect(rangeOperationToMetadataKey).toEqual({
      append: '__rangeOperationAppend__',
      ignore: '__rangeOperationIgnore__',
      prepend: '__rangeOperationPrepend__',
      refetch: '__rangeOperationRefetch__',
      remove: '__rangeOperationRemove__',
    });
  });

  it('is frozen', () => {
    expect(Object.isFrozen(rangeOperationToMetadataKey)).toBe(true);
  });
});
