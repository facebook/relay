/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path = require('path');
import * as fs from 'fs/promises';
import * as semver from 'semver';
import {workspace} from 'vscode';
import {RelayExtensionContext} from '../context';
import {RelayTextDocumentContentProvider} from './textDocumentContentProvider';

export async function registerProviders(context: RelayExtensionContext) {
  const relayCompilerDirectory = path.join(
    context.relayBinaryExecutionOptions.binaryPath,
    '../..',
  );

  let packageManifest: any;

  try {
    packageManifest = JSON.parse(
      await fs.readFile(
        path.join(relayCompilerDirectory, 'package.json'),
        'utf-8',
      ),
    );
  } catch {
    // If we can't read this file, we don't have to bother continuing.
    return;
  }

  const isSemverRangeSatisfied = semver.satisfies(
    packageManifest.version,
    '>=14.2',
  );

  const isPrerelease = semver.prerelease(packageManifest.version) != null;

  if (!isSemverRangeSatisfied && !isPrerelease) {
    // The config-schema.json does not yet part of the relay-compiler
    // version used by the client.
    return;
  }

  const configJsonSchemaPath = path.join(
    relayCompilerDirectory,
    'config-schema.json',
  );

  context.extensionContext.subscriptions.push(
    workspace.registerTextDocumentContentProvider(
      RelayTextDocumentContentProvider.scheme,
      new RelayTextDocumentContentProvider(configJsonSchemaPath),
    ),
  );
}
