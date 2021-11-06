/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const RelayProfiler = {
  profile: jest.fn(() => {
    return {
      stop: jest.fn(),
    };
  }),
  attachProfileHandler: jest.fn(),
  detachProfileHandler: jest.fn(),
};

module.exports = RelayProfiler;
