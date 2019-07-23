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
const RelayNetworkLoggerTransaction = require('./RelayNetworkLoggerTransaction');

const createRelayNetworkLogger = require('./createRelayNetworkLogger');

import type {SubscribeFunction, FetchFunction} from './RelayNetworkTypes.js';
import type {GraphiQLPrinter} from './createRelayNetworkLogger.js';

module.exports = (createRelayNetworkLogger(RelayNetworkLoggerTransaction): {|
  wrapFetch: (
    fetch: FetchFunction,
    graphiQLPrinter?: GraphiQLPrinter,
  ) => FetchFunction,
  wrapSubscribe: (
    subscribe: SubscribeFunction,
    graphiQLPrinter?: GraphiQLPrinter,
  ) => SubscribeFunction,
|});
