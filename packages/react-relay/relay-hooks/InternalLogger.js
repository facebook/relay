/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

type LogEvent = (eventData: string) => void;

let loggerImpl = (eventData: string) => {};

module.exports = {
  setLoggerImplementation(loggerFn: LogEvent): void {
    loggerImpl = loggerFn;
  },
  logEvent: (eventData: string): void => {
    return loggerImpl(eventData);
  },
};
