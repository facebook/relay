/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {Context} from 'react';
import typeof {createContext} from 'react';

const invariant = require('invariant');

// Ideally, we'd just import the type of the react module, but this causes Flow
// problems.
type React = $ReadOnly<{
  createContext: createContext<mixed | null>,
  version: string,
  ...
}>;

let relayLoggingContext: ?Context<mixed | null>;
let firstReact: ?React;

function createRelayLoggingContext(react: React): Context<mixed | null> {
  if (!relayLoggingContext) {
    relayLoggingContext = react.createContext(null);
    if (__DEV__) {
      relayLoggingContext.displayName = 'RelayLoggingContext';
    }
    firstReact = react;
  }
  invariant(
    react === firstReact,
    '[createRelayLoggingContext]: You are passing a different instance of React',
    react.version,
  );
  return relayLoggingContext;
}

module.exports = createRelayLoggingContext;
