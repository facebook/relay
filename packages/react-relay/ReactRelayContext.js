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
const React = require('react');

const {
  __internal: {createRelayContext},
} = require('relay-runtime');

import type {RelayContext} from 'relay-runtime/store/RelayStoreTypes';

module.exports = (createRelayContext(
  React,
): React$Context<RelayContext | null>);
