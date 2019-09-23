/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const invariant = require('invariant');

import type {RelayContext} from './RelayStoreTypes.js';
import typeof {createContext} from 'react';

// Ideally, we'd just import the type of the react module, but this causes Flow
// problems.
type React = {
  createContext: createContext<RelayContext | null>,
  version: string,
};

let relayContext: ?React$Context<RelayContext | null>;
let firstReact: ?React;

function createRelayContext(react: React): React$Context<RelayContext | null> {
  if (!relayContext) {
    relayContext = react.createContext(null);
    firstReact = react;
  }
  invariant(
    react === firstReact,
    '[createRelayContext]: You passing a different instance of React',
    react.version,
  );
  return relayContext;
}

module.exports = createRelayContext;
