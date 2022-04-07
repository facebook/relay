import {ExtensionContext, window} from 'vscode';
import {registerCommands} from './commands/register';

import {RelayExtensionContext} from './context';
import {createAndStartClient} from './languageClient';

let relayExtensionContext: RelayExtensionContext | undefined;

export async function activate(extensionContext: ExtensionContext) {
  relayExtensionContext = {
    client: null,
    outputChannel: window.createOutputChannel('Relay Language Server'),
    extensionContext: extensionContext,
  };

  registerCommands(relayExtensionContext);

  createAndStartClient(relayExtensionContext);
}

export function deactivate(): Thenable<void> | undefined {
  return relayExtensionContext?.client?.stop();
}
