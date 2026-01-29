/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

'use strict';

global.IS_REACT_ACT_ENVIRONMENT = true;
global.IS_REACT_NATIVE_TEST_ENVIRONMENT = true;

global.__DEV__ = true;

require('@babel/runtime/regenerator');

process.env.RTL_SKIP_AUTO_CLEANUP = true;

/**
 * Prettier v3 uses import (cjs/mjs) file formats that jest-runtime does not
 * support. To work around this we need to bypass the jest module system by
 * using the orginal node `require` function.
 */
jest.mock('prettier', () => {
  // $FlowExpectedError[underconstrained-implicit-instantiation]
  const module = jest.requireActual('module');
  return module.prototype.require(require.resolve('prettier'));
});
