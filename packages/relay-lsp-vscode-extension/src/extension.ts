/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

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

  const relayBinary =
    process.env.RELAY_BINARY_PATH ?? (await findRelayBinary(process.cwd()));

  const outputLevel = process.env.RELAY_LSP_LOG_LEVEL ?? "debug";
  // const relayBinary = await findRelayBinary(workspace.rootPath);

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
      //
      closed() {
        window
          .showWarningMessage(
            "Relay LSP client connection got closed unexpectdly.",
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
