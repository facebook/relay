/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var GraphQLStoreChangeEmitter = jest.genMockFromModule('GraphQLStoreChangeEmitter');

GraphQLStoreChangeEmitter.addListenerForIDs.mock.remove = [];
GraphQLStoreChangeEmitter.addListenerForIDs.mockImplementation(() => {
  var returnValue = {remove: jest.genMockFunction()};
  GraphQLStoreChangeEmitter.addListenerForIDs.mock.remove.push(
    returnValue.remove
  );
  return returnValue;
});

module.exports = GraphQLStoreChangeEmitter;
