#!/usr/bin/env node
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @noflow
 * @oncall relay
 */

'use strict';

// eslint-disable-next-line relay-internal/sort-imports
var bin = require('./');
var chalk = require('chalk');
var spawn = require('child_process').spawn;

var input = process.argv.slice(2);

// https://stackoverflow.com/questions/49413443/trouble-debugging-error-with-exit-code-3221225781-missing-libraries-in-windows
const MISSING_CPP_RUNTIME = 3221225781;

if (bin !== null) {
  spawn(bin, input, {stdio: 'inherit'}).on('exit', exitStatus => {
    if (exitStatus === MISSING_CPP_RUNTIME) {
      console.error(
        chalk.bold.red(
          '[!] Missing C++ runtime, required to run relay-compiler. Please install the latest Visual C++ Redistributable for your Windows version from: https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist',
        ),
      );
      console.warn(
        chalk.bold(
          '➥ Additionally, please notify us that you ran into this: https://aka.ms/tmp-missing-relay-dll',
        ),
      );
    }
    process.exit(exitStatus);
  });
} else {
  throw new Error(
    `Platform "${process.platform} (${process.arch})" not supported.`,
  );
}
