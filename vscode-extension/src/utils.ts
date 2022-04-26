/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as path from 'path';
import * as fs from 'fs/promises';

async function exists(file: string): Promise<boolean> {
  return fs
    .stat(file)
    .then(() => true)
    .catch(() => false);
}

// This is derived from the relay-compiler npm package.
// If you update this, please update accordingly here
// https://github.com/facebook/relay/blob/main/packages/relay-compiler/index.js
function getBinaryPathRelativeToPackageJson() {
  let binaryPathRelativeToPackageJson;
  if (process.platform === 'darwin' && process.arch === 'x64') {
    binaryPathRelativeToPackageJson = path.join('macos-x64', 'relay');
  } else if (process.platform === 'darwin' && process.arch === 'arm64') {
    binaryPathRelativeToPackageJson = path.join('macos-arm64', 'relay');
  } else if (process.platform === 'linux' && process.arch === 'x64') {
    binaryPathRelativeToPackageJson = path.join('linux-x64', 'relay');
  } else if (process.platform === 'linux' && process.arch === 'arm64') {
    binaryPathRelativeToPackageJson = path.join('linux-arm64', 'relay');
  } else if (process.platform === 'win32' && process.arch === 'x64') {
    binaryPathRelativeToPackageJson = path.join('win-x64', 'relay.exe');
  } else {
    binaryPathRelativeToPackageJson = null;
  }

  if (binaryPathRelativeToPackageJson) {
    return path.join(
      '.',
      'node_modules',
      'relay-compiler',
      binaryPathRelativeToPackageJson,
    );
  }

  return null;
}

export async function findRelayBinary(
  rootPath: string,
): Promise<string | null> {
  const binaryPathRelativeToPackageJson = getBinaryPathRelativeToPackageJson();

  if (!binaryPathRelativeToPackageJson) {
    return null;
  }

  let counter = 0;
  let currentPath = rootPath;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (counter >= 5000) {
      throw new Error(
        'Could not find Relay binary after 5000 traversals. This is likely a bug in the extension code and should be reported to https://github.com/facebook/relay/issues',
      );
    }

    counter += 1;

    const possibleBinaryPath = path.join(
      currentPath,
      binaryPathRelativeToPackageJson,
    );

    if (await exists(possibleBinaryPath)) {
      return possibleBinaryPath;
    }

    const nextPath = path.normalize(path.join(currentPath, '..'));

    // Eventually we'll get to `/` and get stuck in a loop.
    if (nextPath === currentPath) {
      break;
    } else {
      currentPath = nextPath;
    }
  }

  return null;
}
