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

const ReactRelayLoggingContext = require('./../ReactRelayLoggingContext');
const {useContext} = require('react');

hook useRelayLoggingContext(): unknown | void {
  return useContext(ReactRelayLoggingContext);
}

module.exports = useRelayLoggingContext;
