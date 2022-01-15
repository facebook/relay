/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noflow
 * @format
 */

'use strict';

const path = require('path');
const { isNonGlibcLinux } = require('detect-libc');

let binary;
if (process.platform === 'darwin' && process.arch === 'x64') {
  binary = path.join(__dirname, 'macos-x64', 'relay');
} else if (process.platform === 'darwin' && process.arch === 'arm64') {
  binary = path.join(__dirname, 'macos-arm64', 'relay');
} else if (process.platform === 'linux' && isNonGlibcLinux) {
  binary = path.join(__dirname, 'linux-musl', 'relay');
} else if (process.platform === 'linux' && process.arch === 'x64') {
  binary = path.join(__dirname, 'linux-x64', 'relay');
} else if (process.platform === 'win32' && process.arch === 'x64') {
  binary = path.join(__dirname, 'win-x64', 'relay.exe');
} else {
  binary = null;
}

module.exports = binary;
