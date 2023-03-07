/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createAndStartCompiler, killCompiler} from '../compiler';
import {getConfig} from '../config';
import {
  createProjectContextFromExtensionContext,
  RelayExtensionContext,
} from '../context';
import {
  createAndStartLanguageClient,
  killLanguageClient,
} from '../languageClient';

export function handleRestartLanguageServerCommand(
  context: RelayExtensionContext,
): void {
  const config = getConfig();

  Object.values(context.projects).forEach(project => {
    const projectContext = createProjectContextFromExtensionContext(
      context,
      project,
    );

    // Was the relay compiler running? Should we auto start it based on their config?
    const shouldRestartCompiler =
      Boolean(project.compilerTerminal) || config.autoStartCompiler;

    const compilerKilledSuccessfully = killCompiler(projectContext);

    if (compilerKilledSuccessfully && shouldRestartCompiler) {
      createAndStartCompiler(projectContext);
    }

    killLanguageClient(projectContext).then(
      languageClientKilledSuccessfully => {
        if (languageClientKilledSuccessfully) {
          createAndStartLanguageClient(projectContext);
        }
      },
    );
  });
}
