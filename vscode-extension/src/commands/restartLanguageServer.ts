import {window, commands} from 'vscode';
import {RelayExtensionContext} from '../context';
import {createAndStartClient} from '../languageClient';

async function timeout(ms: number): Promise<'timeout'> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('timeout');
    }, ms);
  });
}

export function handleRestartLanguageServerCommand(
  context: RelayExtensionContext,
): void {
  if (!context.client) {
    return;
  }

  Promise.race([timeout(5000), context.client.stop()])
    .then((result) => {
      if (result === 'timeout') {
        window
          .showErrorMessage(
            'Relay LSP Client did not stop after 5 seconds. Try restarting VSCode',
            'Restart',
            'Close',
          )
          .then((selection) => {
            if (selection === 'Restart') {
              commands.executeCommand('workbench.action.reloadWindow');
            }
          });

        return;
      }

      context.outputChannel.appendLine(
        'Successfully stopped existing relay lsp client',
      );

      context.client = null;

      createAndStartClient(context);
    })
    .catch(() => {
      window.showErrorMessage(
        'An error occurred while trying to stop the Relay LSP Client. Try restarting VSCode.',
      );
    });
}
