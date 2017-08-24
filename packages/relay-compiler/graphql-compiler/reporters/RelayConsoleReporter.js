/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayConsoleReporter
 * @flow
 * @format
 */

'use strict';

const chalk = require('chalk');

import type {RelayReporter} from './RelayReporter';

class RelayConsoleReporter implements RelayReporter {
  _verbose: boolean;

  constructor(options: {verbose: boolean}) {
    this._verbose = options.verbose;
  }

  reportError(caughtLocation: string, error: Error): void {
    process.stdout.write(chalk.red('ERROR:\n' + error.message + '\n'));
    if (this._verbose) {
      const frames = error.stack.match(/^ {4}at .*$/gm);
      if (frames) {
        process.stdout.write(
          chalk.gray(
            'From: ' + caughtLocation + '\n' + frames.join('\n') + '\n',
          ),
        );
      }
    }
  }
}

module.exports = RelayConsoleReporter;
