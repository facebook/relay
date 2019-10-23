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
  instrumentMethods: jest.fn((object, names) => {
    for (const [key, name] of Object.entries(names)) {
      object[key] = RelayProfiler.instrument(name, object[key]);
    }
  }),
  instrument: jest.fn((name, handler) => {
    handler.attachHandler = () => {};
    handler.detachHandler = () => {};
    return handler;
  }),
  attachAggregateHandler: jest.fn(),
  detachAggregateHandler: jest.fn(),
  profile: jest.fn(() => {
    return {
      stop: jest.fn(),
    };
  }),
  attachProfileHandler: jest.fn(),
  detachProfileHandler: jest.fn(),
};

module.exports = RelayProfiler;
