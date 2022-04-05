import {window} from 'vscode';
import {RelayExtensionContext} from '../context';
import {createAndStartClient} from '../languageClient';

export function handleRestartLanguageServerCommand(
  context: RelayExtensionContext,
): void {
  if (!context.client) {
    return;
  }

  context.client
    .stop()
    .then(() => {
      context.client = null;

      createAndStartClient(context);
    })
    .catch(() => {
      window.showErrorMessage(
        'An error occurred while trying to stop the Relay LSP Client. Try restarting VSCode.',
      );
    });
}
