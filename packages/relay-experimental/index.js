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

const checkQuery_UNSTABLE = require('./helpers/checkQuery_UNSTABLE');
const createFragmentContainer_UNSTABLE = require('./renderers/createFragmentContainer_UNSTABLE');
const createFragmentRenderer_UNSTABLE = require('./renderers/createFragmentRenderer_UNSTABLE');
const createQueryRenderer_UNSTABLE = require('./renderers/createQueryRenderer_UNSTABLE');
const getRequestKey_UNSTABLE = require('./helpers/getRequestKey_UNSTABLE');
const readFragment_UNSTABLE = require('./helpers/readFragment_UNSTABLE');
const readQuery_UNSTABLE = require('./helpers/readQuery_UNSTABLE');
const retainQuery_UNSTABLE = require('./helpers/retainQuery_UNSTABLE');

const {
  fetchQuery_UNSTABLE,
  getPromiseForRequestInFlight_UNSTABLE,
} = require('./helpers/fetchQuery_UNSTABLE');

module.exports = {
  checkQuery_UNSTABLE: checkQuery_UNSTABLE,
  fetchQuery_UNSTABLE: fetchQuery_UNSTABLE,
  getPromiseForRequestInFlight_UNSTABLE: getPromiseForRequestInFlight_UNSTABLE,
  getRequestKey_UNSTABLE: getRequestKey_UNSTABLE,
  readFragment_UNSTABLE: readFragment_UNSTABLE,
  readQuery_UNSTABLE: readQuery_UNSTABLE,
  retainQuery_UNSTABLE: retainQuery_UNSTABLE,

  createQueryRenderer_UNSTABLE: createQueryRenderer_UNSTABLE,
  createFragmentContainer_UNSTABLE: createFragmentContainer_UNSTABLE,
  createFragmentRenderer_UNSTABLE: createFragmentRenderer_UNSTABLE,
};
