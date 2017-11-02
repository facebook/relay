/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 */

'use strict';

const GraphQLStoreRangeUtils = require.requireActual(
  '../GraphQLStoreRangeUtils',
);

Object.getOwnPropertyNames(GraphQLStoreRangeUtils.prototype).forEach(name => {
  const property = GraphQLStoreRangeUtils.prototype[name];
  if (typeof property === 'function') {
    GraphQLStoreRangeUtils.prototype[name] = jest.fn(property);
  }
});

module.exports = require.requireActual('../GraphQLStoreRangeUtils');
