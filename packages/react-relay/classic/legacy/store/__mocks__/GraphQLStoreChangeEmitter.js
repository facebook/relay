/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const GraphQLStoreChangeEmitter = jest.genMockFromModule(
  '../GraphQLStoreChangeEmitter',
);

GraphQLStoreChangeEmitter.mockImplementation(function() {
  this.addListenerForIDs.mock.remove = [];
  this.addListenerForIDs.mockImplementation(() => {
    const returnValue = {remove: jest.fn()};
    this.addListenerForIDs.mock.remove.push(returnValue.remove);
    return returnValue;
  });

  return this;
});

module.exports = GraphQLStoreChangeEmitter;
