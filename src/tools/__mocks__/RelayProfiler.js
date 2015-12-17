/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const emptyFunction = require('emptyFunction');
const forEachObject = require('forEachObject');

var RelayProfiler = {
  instrumentMethods: jest.genMockFunction().mockImplementation(
    (object, names) => {
      forEachObject(names, (name, key) => {
        object[key] = RelayProfiler.instrument(name, object[key]);
      });
    }
  ),
  instrument: jest.genMockFunction().mockImplementation(
    (name, handler) => {
      handler.attachHandler = emptyFunction;
      handler.detachHandler = emptyFunction;
      return handler;
    }
  ),
  attachAggregateHandler: jest.genMockFunction(),
  detachAggregateHandler: jest.genMockFunction(),
  profile: jest.genMockFunction().mockImplementation(() => {
    return {
      stop: jest.genMockFunction(),
    };
  }),
  attachProfileHandler: jest.genMockFunction(),
  detachProfileHandler: jest.genMockFunction(),
};

module.exports = RelayProfiler;
