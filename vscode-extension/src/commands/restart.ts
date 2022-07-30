/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createAndStartCompiler, killCompiler} from '../compiler';
import {getConfig} from '../config';
import {RelayExtensionContext} from '../context';
import {
  createAndStartLanguageClient,
  killLanguageClient,
} from '../languageClient';

export function handleRestartLanguageServerCommand(
  context: RelayExtensionContext,
): void {
  const config = getConfig();

  // Was the relay compiler running? Should we auto start it based on their config?
  const shouldRestartCompiler =
    Boolean(context.compilerTerminal) || config.autoStartCompiler;

  const compilerKilledSuccessfully = killCompiler(context);

  if (compilerKilledSuccessfully && shouldRestartCompiler) {
    createAndStartCompiler(context);
  }

  killLanguageClient(context).then(languageClientKilledSuccessfully => {
    if (languageClientKilledSuccessfully) {
      createAndStartLanguageClient(context);
    }
  });
}
