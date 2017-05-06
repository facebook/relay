/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 */

'use strict';

const RelayMockCacheManager = {
  genCacheManager: function() {
    const mutationWriter = genMockWriter();
    const queryWriter = genMockWriter();
    return {
      mocks: {
        mutationWriter,
        queryWriter,
      },
      getMutationWriter: jest.fn(() => mutationWriter),
      getQueryWriter: jest.fn(() => queryWriter),
    };
  },
};

function genMockWriter() {
  return {
    writeField: jest.fn(),
    writeNode: jest.fn(),
    writeRootCall: jest.fn(),
  };
}

module.exports = RelayMockCacheManager;
