#!/usr/bin/env node
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noflow
 * @format
 */

'use strict';

var bin = require('./');
var spawn = require('child_process').spawn;

var input = process.argv.slice(2);

if (bin !== null) {
  spawn(bin, input, {stdio: 'inherit'}).on('exit', process.exit);
} else {
  throw new Error('Platform not supported.');
}
