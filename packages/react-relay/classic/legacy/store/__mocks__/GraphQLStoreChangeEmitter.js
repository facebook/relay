/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const GraphQLStoreChangeEmitter = jest.genMockFromModule('GraphQLStoreChangeEmitter');

GraphQLStoreChangeEmitter.mockImplementation(function() {
  this.addListenerForIDs.mock.remove = [];
  this.addListenerForIDs.mockImplementation(() => {
    const returnValue = {remove: jest.fn()};
    this.addListenerForIDs.mock.remove.push(
      returnValue.remove
    );
    return returnValue;
  });

  return this;
});

module.exports = GraphQLStoreChangeEmitter;
