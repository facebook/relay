import { workspace, ExtensionContext, window } from "vscode";

import {
  CloseAction,
  ErrorAction,
  LanguageClient,
  LanguageClientOptions,
  RevealOutputChannelOn,
  ServerOptions,
} from "vscode-languageclient/node";
import { findRelayBinary } from "./utils";

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
  const outputChannel = window.createOutputChannel("Relay Language Server");

  // TODO: Support multi folder workspaces by not using rootPath.
  // Maybe initialize a client once for each workspace?
  const relayBinary =
  // TODO: Use VSCode config instead of process.env
    process.env.RELAY_BINARY_PATH ?? (await findRelayBinary(workspace.rootPath));

  // TODO: Use VSCode config instead of process.env
  const outputLevel = process.env.RELAY_LSP_LOG_LEVEL ?? "debug";

  if (!relayBinary) {
    outputChannel.appendLine(
      "Could not find relay binary in path. Maybe you're not inside of a project with relay installed."
    );

    return;
  }

  outputChannel.appendLine(`Using relay binary: ${relayBinary}`);

  const serverOptions: ServerOptions = {
    command: relayBinary,
    args: ["lsp", `--output=${outputLevel}`],
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    markdown: {
      isTrusted: true
    },
    documentSelector: [
      { scheme: "file", language: "javascript" },
      { scheme: "file", language: "typescript" },
      { scheme: "file", language: "typescriptreact" },
      { scheme: "file", language: "javascriptreact" },
    ],

    outputChannel,

    // Since we use stderr for debug logs, the "Something went wrong" popup
    // in VSCode shows up a lot. This tells vscode not to show it in any case.
    revealOutputChannelOn: RevealOutputChannelOn.Never,

    initializationFailedHandler: (error) => {
      outputChannel.appendLine(`initializationFailedHandler ${error}`);

      return true;
    },

    errorHandler: {
      // This happens when the LSP server stops running.
      // e.g. Could not find relay config.
      // e.g. watchman was not installed.
      //
      // TODO: Figure out the best way to handle this `closed` event
      //
      // Some of these messages are worth surfacing and others are not
      // e.g. "Watchman is not installed" is important to surface to the user
      // but "No relay config found" is not relevant since the user is likely
      // just in a workspace where they don't have a relay config.
      //
      // We already bail early if there is no relay binary found. 
      // So maybe we should just show all of these messages since it would
      // be weird if you had a relay binary in your node modules but no relay
      // config could be found. 🤷 for now.
      closed() {
        window
          .showWarningMessage(
            "Relay LSP client connection got closed unexpectedly.",
            "Go to output",
            "Ignore"
          )
          .then((selected) => {
            if (selected === "Go to output") {
              client.outputChannel.show();
            }
          });

        return CloseAction.DoNotRestart;
      },
      // This `error` callback should probably never happen. 🙏
      error() {
        window
          .showWarningMessage(
            "An error occurred while writing/reading to/from the relay lsp connection",
            "Go to output",
            "Ignore"
          )
          .then((selected) => {
            if (selected === "Go to output") {
              client.outputChannel.show();
            }
          });

        return ErrorAction.Continue;
      },
    },
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "RelayLanguageClient",
    "Relay Language Client",
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
