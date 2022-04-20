/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { window } from 'vscode';
import { RelayExtensionContext } from '../context';
import { createAndStartClient } from '../languageClient';

export function handleRestartLanguageServerCommand(
  context: RelayExtensionContext,
): void {
  if (!context.client) {
    return;
  }

  context.client
    .stop()
    .then(() => {
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
