/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
} = require("vscode-languageclient");
const path = require('path');

let client = null;

function activate(context) {
    // TODO(brandondail) implement a real binary resolution strategy
    const command = path.resolve('./target/debug/relay-lsp');
    const serverOptions = { command, args: [] };
    const clientOptions = {
        documentSelector: [
            { scheme: "file", language: "javascript" },
            { scheme: "file", language: "javascriptreact" },
        ],
    };
    client = new LanguageClient(
        "relay-lsp",
        "Relay Language Server",
        serverOptions,
        clientOptions
    );
    client.start();
}

function deactivate() {
    if (client == null) {
        return;
    }
    return client.stop();
}

module.exports = { activate, deactivate };
