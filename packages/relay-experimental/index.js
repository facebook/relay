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

const createFragmentContainer_UNSTABLE = require('./renderers/createFragmentContainer_UNSTABLE');
const createQueryRenderer_UNSTABLE = require('./renderers/createQueryRenderer_UNSTABLE');
const fetchQuery_UNSTABLE = require('./helpers/fetchQuery_UNSTABLE');

module.exports = {
  fetchQuery_UNSTABLE: fetchQuery_UNSTABLE,

  createQueryRenderer_UNSTABLE: createQueryRenderer_UNSTABLE,
  createFragmentContainer_UNSTABLE: createFragmentContainer_UNSTABLE,
};
