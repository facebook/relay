/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import * as semver from 'semver';
import {OutputChannel, window, workspace} from 'vscode';
import {SEMVER_RANGE} from '../constants';
import {getConfig} from '../config';

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

async function findRelayCompilerDirectory(
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
  | {kind: 'compilerFound'; path: string; version: string}
  | {kind: 'prereleaseCompilerFound'; path: string; version: string}
  | {kind: 'architectureNotSupported'}
  | {kind: 'packageNotFound'}
  | {
      kind: 'versionDidNotMatch';
      path: string;
      version: string;
      expectedRange: string;
    };

async function findRelayCompilerBinary(
  rootPath: string,
): Promise<RelayCompilerPackageInformation> {
  const relayCompilerDirectory = await findRelayCompilerDirectory(rootPath);

  if (!relayCompilerDirectory) {
    return {kind: 'packageNotFound'};
  }

  const relayBinaryRelativeToPackage = getBinaryPathRelativeToPackage();

  if (!relayBinaryRelativeToPackage) {
    return {kind: 'architectureNotSupported'};
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
      version: packageManifest.version,
    };
  }
  if (isSemverRangeSatisfied) {
    return {
      kind: 'compilerFound',
      path: relayBinaryPath,
      version: packageManifest.version,
    };
  }

  return {
    kind: 'versionDidNotMatch',
    path: relayBinaryPath,
    expectedRange: SEMVER_RANGE,
    version: packageManifest.version,
  };
}

type RelayCompilerBinary = {
  /**
   * The path to the binary.
   */
  path: string;
  /**
   * The version of the binary, or `undefined` if the binary
   * wasn't resolved through the versioned relay-compiler package.
   */
  version?: string;
};

export async function findRelayBinaryWithWarnings(
  outputChannel: OutputChannel,
): Promise<RelayCompilerBinary | null> {
  const config = getConfig();

  let rootPath = workspace.rootPath || process.cwd();
  if (config.rootDirectory) {
    rootPath = path.join(rootPath, config.rootDirectory);
  }

  outputChannel.appendLine(
    `Searching for the relay-compiler starting at: ${rootPath}`,
  );
  const relayBinaryResult = await findRelayCompilerBinary(rootPath);

  if (config.pathToRelay) {
    outputChannel.appendLine(
      "You've manually specified 'relay.pathToRelay'. We cannot confirm this version of the Relay Compiler is supported by this version of the extension. I hope you know what you're doing.",
    );

    return {path: config.pathToRelay};
  }
  if (relayBinaryResult.kind === 'versionDidNotMatch') {
    window.showErrorMessage(
      // Array syntax so it's easier to read this message in the source code.
      [
        `The installed version of the Relay Compiler is version: '${relayBinaryResult.version}'.`,
        `We found this version in the package.json at the following path: ${relayBinaryResult.path}`,
        `This version of the extension supports the following semver range: '${relayBinaryResult.expectedRange}'.`,
        'Please update your extension / relay-compiler to accommodate the version requirements.',
      ].join(' '),
      'Okay',
    );

    return null;
  }
  if (relayBinaryResult.kind === 'packageNotFound') {
    outputChannel.appendLine(
      "Could not find the 'relay-compiler' package in your node_modules. Maybe you're not inside of a project with relay installed.",
    );

    return null;
  }
  if (relayBinaryResult.kind === 'architectureNotSupported') {
    outputChannel.appendLine(
      `The 'relay-compiler' does not ship a binary for the architecture: ${process.arch}`,
    );

    return null;
  }
  if (relayBinaryResult.kind === 'prereleaseCompilerFound') {
    outputChannel.appendLine(
      [
        'You have a pre-release version of the relay-compiler package installed.',
        'We are unable to confirm if this version is compatible with the Relay',
        'VSCode Extension. Proceeding on the assumption that you know what you are',
        'doing.',
      ].join(' '),
    );

    return {path: relayBinaryResult.path, version: relayBinaryResult.version};
  }

  if (relayBinaryResult.kind === 'compilerFound') {
    return {path: relayBinaryResult.path, version: relayBinaryResult.version};
  }

  return null;
}
