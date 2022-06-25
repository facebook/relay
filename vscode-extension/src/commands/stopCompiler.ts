/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {window} from 'vscode';
import {
  createProjectContextFromExtensionContext,
  RelayExtensionContext,
} from '../context';
import {killCompiler} from '../compiler';

export function handleStopCompilerCommand(
  context: RelayExtensionContext,
): void {
  Object.values(context.projects).forEach(project => {
    const projectContext = createProjectContextFromExtensionContext(
      context,
      project,
    );

    if (!project.compilerTerminal) {
      window.showWarningMessage('Relay Compiler not running.');

      return;
    }

    killCompiler(projectContext);
  });
}
