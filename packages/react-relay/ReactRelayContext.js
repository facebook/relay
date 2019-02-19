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
const React = require('React');

import type {RelayContext} from 'relay-runtime';

const ReactRelayContext: React$Context<RelayContext | null> = React.createContext(
  null,
);

module.exports = ReactRelayContext;
