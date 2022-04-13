/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {ExtensionContext, window} from 'vscode';
import {registerCommands} from './commands/register';

import {RelayExtensionContext} from './context';
import {createAndStartClient} from './languageClient';
import {createStatusBar, initializeStatusBar} from './statusBar';

let relayExtensionContext: RelayExtensionContext | undefined;

export async function activate(extensionContext: ExtensionContext) {
  const outputChannel = window.createOutputChannel('Relay Language Server');
  const statusBar = createStatusBar();

  relayExtensionContext = {
    statusBar,
    client: null,
    outputChannel,
    extensionContext,
  };

  extensionContext.subscriptions.push(outputChannel);

  initializeStatusBar(relayExtensionContext);
  registerCommands(relayExtensionContext);
  createAndStartClient(relayExtensionContext);
}

export function deactivate(): Thenable<void> | undefined {
  relayExtensionContext?.outputChannel.dispose();

  return relayExtensionContext?.client?.stop();
}
