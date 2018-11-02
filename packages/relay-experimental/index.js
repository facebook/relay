/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const createSuspenseFragmentContainer = require('./renderers/createSuspenseFragmentContainer');
const createSuspenseQueryRenderer = require('./renderers/createSuspenseQueryRenderer');
const fetchQuery_UNSTABLE = require('./helpers/fetchQuery_UNSTABLE');
const lazyLoadFragmentMatch = require('./lazyLoadFragmentMatch');

module.exports = {
  fetchQuery_UNSTABLE: fetchQuery_UNSTABLE,
  lazyLoadFragmentMatch: lazyLoadFragmentMatch,

  createSuspenseQueryRenderer: createSuspenseQueryRenderer,
  createSuspenseFragmentContainer: createSuspenseFragmentContainer,
};
