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

const path = require('path');

// We copy this binary resolution in the VSCode extension
// If this changes, please update accordingly in here
// https://github.com/facebook/relay/blob/main/vscode-extension/src/utils.ts
let binary;
if (process.platform === 'darwin' && process.arch === 'x64') {
  binary = path.join(__dirname, 'macos-x64', 'relay');
} else if (process.platform === 'darwin' && process.arch === 'arm64') {
  binary = path.join(__dirname, 'macos-arm64', 'relay');
} else if (process.platform === 'linux' && process.arch === 'x64') {
  binary = path.join(__dirname, 'linux-x64', 'relay');
} else if (process.platform === 'linux' && process.arch === 'arm64') {
  binary = path.join(__dirname, 'linux-arm64', 'relay');
} else if (process.platform === 'win32' && process.arch === 'x64') {
  binary = path.join(__dirname, 'win-x64', 'relay.exe');
} else {
  binary = null;
}

module.exports = binary;
