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
import { getConfig } from './config';
import { RelayExtensionContext } from './context';
import { createErrorHandler } from './errorHandler';
import { LSPStatusBarFeature } from './lspStatusBarFeature';
import { findRelayCompilerBinary } from './utils';

export async function createAndStartClient(context: RelayExtensionContext) {
  context.outputChannel.appendLine('Starting the Relay GraphQL extension...');

  const config = getConfig();
  const rootPath = workspace.rootPath || process.cwd();

  const relayBinaryResult = await findRelayCompilerBinary(rootPath);

  let relayBinary: string | undefined;
  if (config.pathToRelay) {
    context.outputChannel.appendLine(
      "You've manually specified 'relay.pathToBinary'. We cannot confirm this version of the Relay Compiler is supported by this version of the extension. I hope you know what you're doing.",
    );

    relayBinary = config.pathToRelay;
  } else if (relayBinaryResult.kind === 'versionDidNotMatch') {
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

    return;
  } else if (relayBinaryResult.kind === 'packageNotFound') {
    context.outputChannel.appendLine(
      "Could not find the 'relay-compiler' package in your node_modules. Maybe you're not inside of a project with relay installed.",
    );

    return;
  } else if (relayBinaryResult.kind === 'architectureNotSupported') {
    context.outputChannel.appendLine(
      `The 'relay-compiler' does not ship a binary for the architecture: ${process.arch}`,
    );

    return;
  } else if (relayBinaryResult.kind === 'compilerFound') {
    relayBinary = relayBinaryResult.path;
  }

  if (!relayBinary) {
    context.outputChannel.appendLine(
      'Stopping execution of the Relay VSCode extension since we could not find a valid compiler binary.',
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
