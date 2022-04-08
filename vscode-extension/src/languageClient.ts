import {DocumentSelector, workspace} from 'vscode';
import {
  ClientCapabilities,
  Disposable,
  LanguageClientOptions,
  RequestType,
  RevealOutputChannelOn,
  ServerCapabilities,
} from 'vscode-languageclient';
import {ServerOptions, LanguageClient} from 'vscode-languageclient/node';
import {getConfig} from './config';
import {RelayExtensionContext} from './context';
import {createErrorHandler} from './errorHandler';
import {handleShowStatusMethod, ShowStatusParams} from './statusBar';
import {findRelayBinary} from './utils';

export async function createAndStartClient(context: RelayExtensionContext) {
  const config = getConfig();

  // TODO: Support multi folder workspaces by not using rootPath.
  // Maybe initialize a client once for each workspace?
  const relayBinary =
    config.pathToRelay ||
    (await findRelayBinary(workspace.rootPath ?? process.cwd()));

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
      {scheme: 'file', language: 'javascript'},
      {scheme: 'file', language: 'typescript'},
      {scheme: 'file', language: 'typescriptreact'},
      {scheme: 'file', language: 'javascriptreact'},
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

  let showStatusDisposable: Disposable | undefined;
  client.registerFeature({
    fillClientCapabilities() {},

    initialize() {
      showStatusDisposable = client?.onRequest(
        new RequestType<ShowStatusParams, void, void>('window/showStatus'),
        (params) => {
          handleShowStatusMethod(context, params);
        },
      );
    },

    dispose() {
      showStatusDisposable?.dispose();
    },
  });

  // Start the client. This will also launch the server
  client.start();
  context.client = client;
}
