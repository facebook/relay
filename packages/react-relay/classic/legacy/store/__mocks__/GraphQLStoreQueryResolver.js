/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

class GraphQLStoreQueryResolver {
  constructor(store, queryFragment, callback) {
    const mockInstances = GraphQLStoreQueryResolver.mock.instances;
    this.mock = {
      callback,
      index: mockInstances.length,
      queryFragment,
      store,
    };
    this.resolve = jest.fn((...args) => {
      const mockConstructor = GraphQLStoreQueryResolver.mock;
      const mockResolve =
        mockConstructor.resolveImplementations[this.mock.index] ||
        mockConstructor.defaultResolveImplementation;
      return mockResolve.apply(this, args);
    });
    this.reset = jest.fn();
    this.dispose = jest.fn();
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
