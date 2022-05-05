/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { window, workspace } from 'vscode';
import {
  LanguageClientOptions,
  RevealOutputChannelOn,
} from 'vscode-languageclient';
import { ServerOptions, LanguageClient } from 'vscode-languageclient/node';
import * as semver from 'semver';
import { getConfig } from './config';
import { RelayExtensionContext } from './context';
import { createErrorHandler } from './errorHandler';
import { LSPStatusBarFeature } from './lspStatusBarFeature';
import { findRelayBinary, findRelayCompilerVersion } from './utils';
import { SEMVER_RANGE } from './constants';

export async function createAndStartClient(context: RelayExtensionContext) {
  const config = getConfig();
  const rootPath = workspace.rootPath || process.cwd();

  // If they set the `pathToRelay`, we can assume the user knows what they're doing
  // If they haven't set it, we need to check their `relay-compiler` package
  // to ensure they have a version supported by the published extension
  if (!config.pathToRelay) {
    const compilerVersionResult = await findRelayCompilerVersion(rootPath);

    if (compilerVersionResult) {
      const { version, path } = compilerVersionResult;
      const isSemverRangeSatisfied = semver.satisfies(version, SEMVER_RANGE);

      if (!isSemverRangeSatisfied) {
        window.showErrorMessage(
          // Array syntax so it's easier to read this message in the source code.
          [
            `The installed version of the Relay Compiler is version: '${version}'.`,
            `We found this version in the package.json at the following path: ${path}`,
            `This version of the extension supports the following semver range: '${SEMVER_RANGE}'.`,
            'Please update your extension / relay-compiler to accommodate the version requirements.',
          ].join(' '),
          'Okay',
        );

        return;
      }
    } else {
      window.showWarningMessage(
        'Could not determine version of Relay Compiler',
        'Okay',
      );
    }
  } else {
    context.outputChannel.appendLine(
      "You've manually specified 'relay.pathToBinary'. We cannot confirm this version of the Relay Compiler is supported by this version of the extension. I hope you know what you're doing.",
    );
  }

  // TODO: Support multi folder workspaces by not using rootPath.
  // Maybe initialize a client once for each workspace?
  const relayBinary = config.pathToRelay || (await findRelayBinary(rootPath));

  context.outputChannel.appendLine('Starting the Relay GraphQL extension...');

  if (!relayBinary) {
    context.outputChannel.appendLine(
      "Could not find relay binary in path. Maybe you're not inside of a project with relay installed.",
    );

    return;
  }

  context.outputChannel.appendLine(`Using relay binary: ${relayBinary}`);

  const serverOptions: ServerOptions = {
    command: relayBinary,
    args: ['lsp', `--output=${config.outputLevel}`],
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    markdown: {
      isTrusted: true,
    },
    documentSelector: [
      { scheme: 'file', language: 'javascript' },
      { scheme: 'file', language: 'typescript' },
      { scheme: 'file', language: 'typescriptreact' },
      { scheme: 'file', language: 'javascriptreact' },
    ],

    outputChannel: context.outputChannel,

    // Since we use stderr for debug logs, the "Something went wrong" popup
    // in VSCode shows up a lot. This tells vscode not to show it in any case.
    revealOutputChannelOn: RevealOutputChannelOn.Never,

    initializationFailedHandler: (error) => {
      context?.outputChannel.appendLine(`initializationFailedHandler ${error}`);

      return true;
    },

    errorHandler: createErrorHandler(context),
  };

  // Create the language client and start the client.
  const client = new LanguageClient(
    'RelayLanguageClient',
    'Relay Language Client',
    serverOptions,
    clientOptions,
  );

  client.registerFeature(new LSPStatusBarFeature(context));

  // Start the client. This will also launch the server
  client.start();
  context.client = client;
}
