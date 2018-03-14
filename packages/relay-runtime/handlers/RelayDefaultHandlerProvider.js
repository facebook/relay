/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const RelayConnectionHandler = require('./connection/RelayConnectionHandler');
const RelayViewerHandler = require('./viewer/RelayViewerHandler');

const invariant = require('invariant');

import type {Handler} from '../store/RelayStoreTypes';
export type HandlerProvider = (name: string) => ?Handler;

function RelayDefaultHandlerProvider(handle: string): Handler {
  switch (handle) {
    case 'connection':
      return RelayConnectionHandler;
    case 'viewer':
      return RelayViewerHandler;
  }
  invariant(
    false,
    'RelayDefaultHandlerProvider: No handler provided for `%s`.',
    handle,
  );
}

module.exports = RelayDefaultHandlerProvider;
