/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {ExtensionContext, OutputChannel, StatusBarItem, Terminal} from 'vscode';
import {LanguageClient} from 'vscode-languageclient/node';

// Mutable object to pass around to command handlers so they
// can reference the current state of the extension
//
// Things like configuration should not be stored in this context
// as they should be resolved contextually (workspace, file, etc).
// This state is global to the entire extension.
// At some point, we'll most likely have a map of Workspace => LSP Client
// for downstream callers to use.
//
// We're not using the VSCode's API for this since that state must be serializable
// as it's persisted to disk.
// https://code.visualstudio.com/api/extension-capabilities/common-capabilities#data-storage
export type RelayExtensionContext = {
  statusBar: StatusBarItem;
  client: LanguageClient | null;
  lspOutputChannel: OutputChannel;
  extensionContext: ExtensionContext;
  primaryOutputChannel: OutputChannel;
  compilerTerminal: Terminal | null;
  relayBinaryExecutionOptions: {
    rootPath: string;
    binaryPath: string;
    binaryVersion?: string;
  };
};
