/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
