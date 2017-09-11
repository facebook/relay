/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GraphQLMultiReporter
 * @flow
 * @format
 */

'use strict';

import type {GraphQLReporter} from './GraphQLReporter';

class GraphQLMultiReporter implements GraphQLReporter {
  _reporters: Array<GraphQLReporter>;

  constructor(...reporters: Array<GraphQLReporter>) {
    this._reporters = reporters;
  }

  reportError(caughtLocation: string, error: Error): void {
    this._reporters.forEach(reporter => {
      reporter.reportError(caughtLocation, error);
    });
  }
}

module.exports = GraphQLMultiReporter;
