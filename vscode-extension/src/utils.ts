/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import * as semver from 'semver';
import { SEMVER_RANGE } from './constants';

async function exists(file: string): Promise<boolean> {
  return fs
    .stat(file)
    .then(() => true)
    .catch(() => false);
}

// This is derived from the relay-compiler npm package.
// If you update this, please update accordingly here
// https://github.com/facebook/relay/blob/main/packages/relay-compiler/index.js
function getBinaryPathRelativeToPackage(): string | null {
  if (process.platform === 'darwin' && process.arch === 'x64') {
    return path.join('macos-x64', 'relay');
  }

  if (process.platform === 'darwin' && process.arch === 'arm64') {
    return path.join('macos-arm64', 'relay');
  }

  if (process.platform === 'linux' && process.arch === 'x64') {
    return path.join('linux-x64', 'relay');
  }

  if (process.platform === 'linux' && process.arch === 'arm64') {
    return path.join('linux-arm64', 'relay');
  }

  if (process.platform === 'win32' && process.arch === 'x64') {
    return path.join('win-x64', 'relay.exe');
  }

  return null;
}
export async function findRelayCompilerDirectory(
  rootPath: string,
): Promise<string | null> {
  let counter = 0;
  let currentPath = rootPath;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (counter >= 5000) {
      throw new Error(
        'Could not find relay-compiler directory after 5000 traversals. This is likely a bug in the extension code and should be reported to https://github.com/facebook/relay/issues',
      );
    }

    counter += 1;

    const possibleBinaryPath = path.join(
      currentPath,
      'node_modules',
      'relay-compiler',
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

type RelayCompilerPackageInformation =
  | { kind: 'compilerFound'; path: string }
  | { kind: 'prereleaseCompilerFound'; path: string }
  | { kind: 'architectureNotSupported' }
  | { kind: 'packageNotFound' }
  | {
      kind: 'versionDidNotMatch';
      path: string;
      version: string;
      expectedRange: string;
    };

export async function findRelayCompilerBinary(
  rootPath: string,
): Promise<RelayCompilerPackageInformation> {
  const relayCompilerDirectory = await findRelayCompilerDirectory(rootPath);

  if (!relayCompilerDirectory) {
    return { kind: 'packageNotFound' };
  }

  const relayBinaryRelativeToPackage = getBinaryPathRelativeToPackage();

  if (!relayBinaryRelativeToPackage) {
    return { kind: 'architectureNotSupported' };
  }

  const packageManifest = JSON.parse(
    await fs.readFile(
      path.join(relayCompilerDirectory, 'package.json'),
      'utf-8',
    ),
  );

  const isSemverRangeSatisfied = semver.satisfies(
    packageManifest.version,
    SEMVER_RANGE,
  );

  // If you are using a pre-release version of the compiler, we assume you know
  // what you are doing.
  const isPrerelease = semver.prerelease(packageManifest.version) != null;

  const relayBinaryPath = path.join(
    relayCompilerDirectory,
    relayBinaryRelativeToPackage,
  );

  if (isPrerelease) {
    return {
      kind: 'prereleaseCompilerFound',
      path: relayBinaryPath,
    };
  }
  if (isSemverRangeSatisfied) {
    return {
      kind: 'compilerFound',
      path: relayBinaryPath,
    };
  }

  return {
    kind: 'versionDidNotMatch',
    path: relayBinaryPath,
    expectedRange: SEMVER_RANGE,
    version: packageManifest.version,
  };
}
