/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const ConnectionHandler = require('./connection/ConnectionHandler');

const invariant = require('invariant');

import type {Handler} from '../store/RelayStoreTypes';
export type HandlerProvider = (name: string) => ?Handler;

function RelayDefaultHandlerProvider(handle: string): Handler {
  switch (handle) {
    case 'connection':
      return ConnectionHandler;
  }
  invariant(
    false,
    'RelayDefaultHandlerProvider: No handler provided for `%s`.',
    handle,
  );
}

module.exports = RelayDefaultHandlerProvider;
