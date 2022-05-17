/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ExtensionContext, window } from 'vscode';
import { registerCommands } from './commands/register';

import { RelayExtensionContext } from './context';
import { createAndStartClient } from './languageClient';
import { createStatusBarItem, intializeStatusBarItem } from './statusBarItem';

let relayExtensionContext: RelayExtensionContext | undefined;

export async function activate(extensionContext: ExtensionContext) {
  const primaryOutputChannel = window.createOutputChannel('Relay');

  const lspOutputChannel = window.createOutputChannel('Relay LSP Logs');

  const statusBar = createStatusBarItem();

  relayExtensionContext = {
    statusBar,
    client: null,
    extensionContext,
    lspOutputChannel,
    primaryOutputChannel,
    compilerProcess: null,
  };

  extensionContext.subscriptions.push(primaryOutputChannel);
  extensionContext.subscriptions.push(statusBar);

  intializeStatusBarItem(relayExtensionContext);
  registerCommands(relayExtensionContext);
  createAndStartClient(relayExtensionContext);
}

export function deactivate(): Thenable<void> | undefined {
  relayExtensionContext?.primaryOutputChannel.dispose();

  return relayExtensionContext?.client?.stop();
}
