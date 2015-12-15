/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

class GraphQLStoreQueryResolver {

  constructor(store, queryFragment, callback) {
    var mockInstances = GraphQLStoreQueryResolver.mock.instances;
    this.mock = {
      callback,
      index: mockInstances.length,
      queryFragment,
      store,
    };
    this.resolve = jest.genMockFunction().mockImplementation((...args) => {
      var mockConstructor = GraphQLStoreQueryResolver.mock;
      var mockResolve =
        mockConstructor.resolveImplementations[this.mock.index] ||
        mockConstructor.defaultResolveImplementation;
      return mockResolve.apply(this, args);
    });
    this.reset = jest.genMockFunction();
    this.dispose = jest.genMockFunction();
    mockInstances.push(this);
  }

  static mockResolveImplementation(mockResolverIndex, callback) {
    this.mock.resolveImplementations[mockResolverIndex] = callback;
  }

  static mockDefaultResolveImplementation(callback) {
    GraphQLStoreQueryResolver.mock.defaultResolveImplementation = callback;
  }
}

GraphQLStoreQueryResolver.mock = {
  instances: [],
  resolveImplementations: [],
  defaultResolveImplementation: () => undefined,
};

module.exports = GraphQLStoreQueryResolver;
