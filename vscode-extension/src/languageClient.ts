/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  LanguageClientOptions,
  RevealOutputChannelOn,
} from 'vscode-languageclient';
import {ServerOptions, LanguageClient} from 'vscode-languageclient/node';
import {window} from 'vscode';
import * as path from 'path';
import {RelayExtensionContext} from './context';
import {createErrorHandler} from './errorHandler';
import {LSPStatusBarFeature} from './lspStatusBarFeature';
import {getConfig} from './config';

export function createAndStartLanguageClient(context: RelayExtensionContext) {
  const config = getConfig();

  context.primaryOutputChannel.appendLine(
    `Using relay binary: ${context.relayBinaryExecutionOptions.binaryPath}`,
  );

  const args = ['lsp', `--output=${config.lspOutputLevel}`];

  if (config.pathToConfig) {
    args.push(config.pathToConfig);
  }

  const serverOptions: ServerOptions = {
    options: {
      cwd: context.relayBinaryExecutionOptions.rootPath,
    },
    command: path.resolve(
      context.relayBinaryExecutionOptions.rootPath,
      context.relayBinaryExecutionOptions.binaryPath,
    ),
    args,
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    markdown: {
      isTrusted: true,
    },
    documentSelector: [
      {scheme: 'file', language: 'javascript'},
      {scheme: 'file', language: 'typescript'},
      {scheme: 'file', language: 'typescriptreact'},
      {scheme: 'file', language: 'javascriptreact'},
    ],

    outputChannel: context.lspOutputChannel,

    // Since we use stderr for debug logs, the "Something went wrong" popup
    // in VSCode shows up a lot. This tells vscode not to show it in any case.
    revealOutputChannelOn: RevealOutputChannelOn.Never,

    initializationFailedHandler: error => {
      context?.primaryOutputChannel.appendLine(
        `initializationFailedHandler ${error}`,
      );

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

  context.primaryOutputChannel.appendLine(
    `Starting the Relay Language Server with these options: ${JSON.stringify(
      serverOptions,
    )}`,
  );

  // Start the client. This will also launch the server
  client.start();
  context.client = client;
}

type DidNotError = boolean;

export async function killLanguageClient(
  context: RelayExtensionContext,
): Promise<DidNotError> {
  if (!context.client) {
    return true;
  }

  return context.client
    .stop()
    .then(() => {
      context.primaryOutputChannel.appendLine(
        'Successfully stopped existing relay lsp client',
      );

      context.client = null;

      return true;
    })
    .catch(() => {
      window.showErrorMessage(
        'An error occurred while trying to stop the Relay LSP Client. Try restarting VSCode.',
      );

      return false;
    });
}
