/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path = require('path');
import {ExtensionContext, window, workspace} from 'vscode';
import {registerCommands} from './commands/register';
import {registerProviders, registerNoopProviders} from './providers/register';
import {createAndStartCompiler} from './compiler';
import {getConfig} from './config';

import {RelayExtensionContext} from './context';
import {createAndStartLanguageClient} from './languageClient';
import {createStatusBarItem, intializeStatusBarItem} from './statusBarItem';
import {findRelayBinaryWithWarnings} from './utils/findRelayBinary';

let relayExtensionContext: RelayExtensionContext | null = null;

async function buildRelayExtensionContext(
  extensionContext: ExtensionContext,
): Promise<RelayExtensionContext | null> {
  const config = getConfig();

  const statusBar = createStatusBarItem();
  const primaryOutputChannel = window.createOutputChannel('Relay');
  const lspOutputChannel = window.createOutputChannel('Relay LSP Logs');

  extensionContext.subscriptions.push(statusBar);
  extensionContext.subscriptions.push(lspOutputChannel);
  extensionContext.subscriptions.push(primaryOutputChannel);

  let rootPath = workspace.rootPath || process.cwd();
  if (config.rootDirectory) {
    rootPath = path.join(rootPath, config.rootDirectory);
  }

  const binary = await findRelayBinaryWithWarnings(primaryOutputChannel);

  if (binary) {
    return {
      statusBar,
      client: null,
      extensionContext,
      lspOutputChannel,
      primaryOutputChannel,
      compilerTerminal: null,
      relayBinaryExecutionOptions: {
        rootPath,
        binaryPath: binary.path,
        binaryVersion: binary.version,
      },
    };
  }

  primaryOutputChannel.appendLine(
    'Stopping execution of the Relay VSCode extension since we could not find a valid compiler binary.',
  );

  return null;
}

export async function activate(extensionContext: ExtensionContext) {
  const config = getConfig();

  relayExtensionContext = await buildRelayExtensionContext(extensionContext);

  if (relayExtensionContext) {
    relayExtensionContext.primaryOutputChannel.appendLine(
      'Starting the Relay GraphQL extension...',
    );

    intializeStatusBarItem(relayExtensionContext);
    registerCommands(relayExtensionContext);
    createAndStartLanguageClient(relayExtensionContext);
    registerProviders(relayExtensionContext);

    if (config.autoStartCompiler) {
      createAndStartCompiler(relayExtensionContext);
    } else {
      relayExtensionContext.primaryOutputChannel.appendLine(
        [
          'Not starting the Relay Compiler.',
          'Please enable relay.autoStartCompiler in your settings if you want the compiler to start when you open your project.',
        ].join(' '),
      );
    }
  } else {
    // We still need to register a handler for `relay://` otherwise non-Relay
    // projects will get a warning at the top of their `package.json` files.
    registerNoopProviders(extensionContext);
  }
}

export function deactivate(): Thenable<void> | undefined {
  relayExtensionContext?.primaryOutputChannel.dispose();

  return relayExtensionContext?.client?.stop();
}
