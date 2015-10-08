/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var RelayMockCacheManager = {
  genCacheManager: function() {
    var mutationWriter = genMockWriter();
    var queryWriter = genMockWriter();
    return {
      mocks: {
        mutationWriter,
        queryWriter,
      },
      getMutationWriter:
        jest.genMockFunction().mockReturnValue(mutationWriter),
      getQueryWriter:
        jest.genMockFunction().mockReturnValue(queryWriter),
      readAllData: jest.genMockFunction(),
    };
  },
};

function genMockWriter() {
  return {
    writeField: jest.genMockFunction(),
    writeNode: jest.genMockFunction(),
    writeRootCall: jest.genMockFunction(),
  };
}

module.exports = RelayMockCacheManager;
