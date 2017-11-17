/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule GraphQLConsoleReporter
 * @flow
 * @format
 */

'use strict';

const chalk = require('chalk');

import type {GraphQLReporter} from './GraphQLReporter';

class GraphQLConsoleReporter implements GraphQLReporter {
  _verbose: boolean;

  constructor(options: {verbose: boolean}) {
    this._verbose = options.verbose;
  }

  reportTime(name: string, ms: number): void {
    if (this._verbose) {
      const time =
        ms === 0
          ? chalk.gray(' <1ms')
          : ms < 1000
            ? chalk.blue(leftPad(5, ms + 'ms'))
            : chalk.red(Math.floor(ms / 10) / 100 + 's');
      process.stdout.write('  ' + time + ' ' + chalk.gray(name) + '\n');
    }
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

function leftPad(len, str) {
  return new Array(len - str.length + 1).join(' ') + str;
}

module.exports = GraphQLConsoleReporter;
