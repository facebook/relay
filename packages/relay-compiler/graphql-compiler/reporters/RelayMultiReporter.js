/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMultiReporter
 * @flow
 * @format
 */

'use strict';

import type {RelayReporter} from './RelayReporter';

class RelayMultiReporter implements RelayReporter {
  _reporters: Array<RelayReporter>;

  constructor(...reporters: Array<RelayReporter>) {
    this._reporters = reporters;
  }

  reportError(caughtLocation: string, error: Error): void {
    this._reporters.forEach(reporter => {
      reporter.reportError(caughtLocation, error);
    });
  }
}

module.exports = RelayMultiReporter;
