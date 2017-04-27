/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayDefaultHandlerProvider
 * @flow
 */

'use strict';

const RelayConnectionHandler = require('RelayConnectionHandler');
const RelayViewerHandler = require('RelayViewerHandler');

const invariant = require('invariant');

import type {Handler} from 'RelayStoreTypes';
export type HandlerProvider = (name: string) => ?Handler;

function RelayDefaultHandlerProvider(handle: string): Handler {
  switch (handle) {
    case 'connection': return RelayConnectionHandler;
    case 'viewer': return RelayViewerHandler;
  }
  invariant(
    false,
    'RelayDefaultHandlerProvider: No handler provided for `%s`.',
    handle
  );
}

module.exports = RelayDefaultHandlerProvider;
