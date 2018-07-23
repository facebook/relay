/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const RelayNetworkLoggerTransaction = require('./RelayNetworkLoggerTransaction');

const createRelayNetworkLogger = require('./createRelayNetworkLogger');

module.exports = createRelayNetworkLogger(RelayNetworkLoggerTransaction);
