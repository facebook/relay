/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

const GraphQLStoreDataHandler = require.requireActual('GraphQLStoreDataHandler');

Object.keys(GraphQLStoreDataHandler).forEach(name => {
  const property = GraphQLStoreDataHandler[name];
  if (typeof property === 'function') {
    GraphQLStoreDataHandler[name] =
      jest.genMockFunction().mockImplementation(property);
  }
});

module.exports = require.requireActual('GraphQLStoreDataHandler');
