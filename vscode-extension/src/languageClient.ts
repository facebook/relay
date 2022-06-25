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
import {RelayProjectExtensionContext} from './context';
import {createErrorHandler} from './errorHandler';
import {LSPStatusBarFeature} from './lspStatusBarFeature';
import {getConfig} from './config';

export function createAndStartLanguageClient(
  context: RelayProjectExtensionContext,
) {
  const config = getConfig();

  context.log(
    `Using relay binary: ${context.project.binaryExecutionOptions.binaryPath}`,
  );

  const args = ['lsp', `--output=${config.lspOutputLevel}`];

  if (context.project.binaryExecutionOptions.pathToConfig) {
    args.push(context.project.binaryExecutionOptions.pathToConfig);
  }

  const serverOptions: ServerOptions = {
    options: {
      cwd: context.project.binaryExecutionOptions.rootPath,
    },
    command: path.resolve(
      context.project.binaryExecutionOptions.rootPath,
      context.project.binaryExecutionOptions.binaryPath,
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

    outputChannel: context.project.lspOutputChannel,

    // Since we use stderr for debug logs, the "Something went wrong" popup
    // in VSCode shows up a lot. This tells vscode not to show it in any case.
    revealOutputChannelOn: RevealOutputChannelOn.Never,

    initializationFailedHandler: error => {
      context?.log(`initializationFailedHandler ${error}`);

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

  context.log(
    `Starting the Relay Langauge Server with these options: ${JSON.stringify(
      serverOptions,
      null,
      2,
    )}`,
  );

  // Start the client. This will also launch the server
  client.start();
  context.project.client = client;
}

type DidNotError = boolean;

export async function killLanguageClient(
  context: RelayProjectExtensionContext,
): Promise<DidNotError> {
  if (!context.project.client) {
    return true;
  }

  return context.project.client
    .stop()
    .then(() => {
      context.log('Successfully stopped existing relay lsp client');

      context.project.client = null;

      return true;
    })
    .catch(() => {
      window.showErrorMessage(
        'An error occurred while trying to stop the Relay LSP Client. Try restarting VSCode.',
      );

      return false;
    });
}
