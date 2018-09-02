/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const chalk = require('chalk');

import type {GraphQLReporter} from './GraphQLReporter';

class GraphQLConsoleReporter implements GraphQLReporter {
  _verbose: boolean;
  _quiet: boolean;

  constructor(options: {verbose: boolean, quiet: boolean}) {
    this._verbose = options.verbose;
    this._quiet = options.quiet;
  }

  reportMessage(message: string): void {
    if (!this._quiet) {
      process.stdout.write(message + '\n');
    }
  }

  reportTime(name: string, ms: number): void {
    /* $FlowFixMe(>=0.68.0 site=react_native_fb,react_native_oss) This comment
     * suppresses an error found when Flow v0.68 was deployed. To see the error
     * delete this comment and run Flow. */
    if (this._verbose && !this.quiet) {
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
    if (!this._quiet) {
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
}

function leftPad(len, str) {
  return new Array(len - str.length + 1).join(' ') + str;
}

module.exports = GraphQLConsoleReporter;
