/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

require('babel-runtime/regenerator');

/* eslint-disable no-console */

// TODO(t16118961) remove below once graphql-js updates to suppress this error
const origError = console.error;
console.error = (format, ...args) => {
  if (typeof format === 'string' && format.indexOf('__configs__') >= 0) {
    // ignore warning about __configs__ being a reserved word
    return;
  }
  origError.call(console, format, ...args);
};
