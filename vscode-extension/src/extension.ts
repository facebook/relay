import {ExtensionContext, window} from 'vscode';
import {registerCommands} from './commands/register';

import {RelayExtensionContext} from './context';
import {createAndStartClient} from './languageClient';
import {createStatusBar, initializeStatusBar} from './statusBar';

let relayExtensionContext: RelayExtensionContext | undefined;

export async function activate(extensionContext: ExtensionContext) {
  relayExtensionContext = {
    client: null,
    extensionContext,
    outputChannel: window.createOutputChannel('Relay Language Server'),
    statusBar: createStatusBar(),
  };

  initializeStatusBar(relayExtensionContext);

  registerCommands(relayExtensionContext);

  createAndStartClient(relayExtensionContext);
}

export function deactivate(): Thenable<void> | undefined {
  return relayExtensionContext?.client?.stop();
}
