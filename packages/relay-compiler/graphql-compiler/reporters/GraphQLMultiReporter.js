/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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

  reportTime(name: string, ms: number): void {
    this._reporters.forEach(reporter => {
      reporter.reportTime(name, ms);
    });
  }

  reportError(caughtLocation: string, error: Error): void {
    this._reporters.forEach(reporter => {
      reporter.reportError(caughtLocation, error);
    });
  }
}

module.exports = GraphQLMultiReporter;
