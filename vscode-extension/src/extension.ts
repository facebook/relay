import {workspace, ExtensionContext, window, commands} from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  RevealOutputChannelOn,
  ServerOptions,
} from 'vscode-languageclient/node';
import {getConfig} from './config';
import {RelayExtensionContext} from './context';
import {createErrorHandler} from './errorHandler';
import {findRelayBinary} from './utils';

let relayExtensionContext: RelayExtensionContext | undefined;

export async function activate() {
  const config = getConfig();
  relayExtensionContext = {
    client: null,
    outputChannel: window.createOutputChannel('Relay Language Server'),
  };

  // TODO: Support multi folder workspaces by not using rootPath.
  // Maybe initialize a client once for each workspace?
  const relayBinary =
    config.pathToRelay ||
    (await findRelayBinary(workspace.rootPath ?? process.cwd()));

  if (!relayBinary) {
    relayExtensionContext.outputChannel.appendLine(
      "Could not find relay binary in path. Maybe you're not inside of a project with relay installed.",
    );

    return;
  }

  relayExtensionContext.outputChannel.appendLine(
    `Using relay binary: ${relayBinary}`,
  );

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
      {scheme: 'file', language: 'javascript'},
      {scheme: 'file', language: 'typescript'},
      {scheme: 'file', language: 'typescriptreact'},
      {scheme: 'file', language: 'javascriptreact'},
    ],

    outputChannel: relayExtensionContext.outputChannel,

    // Since we use stderr for debug logs, the "Something went wrong" popup
    // in VSCode shows up a lot. This tells vscode not to show it in any case.
    revealOutputChannelOn: RevealOutputChannelOn.Never,

    initializationFailedHandler: (error) => {
      relayExtensionContext?.outputChannel.appendLine(
        `initializationFailedHandler ${error}`,
      );

      return true;
    },

    errorHandler: createErrorHandler(relayExtensionContext),
  };

  // Create the language client and start the client.
  relayExtensionContext.client = new LanguageClient(
    'RelayLanguageClient',
    'Relay Language Client',
    serverOptions,
    clientOptions,
  );

  // Start the client. This will also launch the server
  relayExtensionContext.client.start();
}

export function deactivate(): Thenable<void> | undefined {
  return relayExtensionContext?.client?.stop();
}
