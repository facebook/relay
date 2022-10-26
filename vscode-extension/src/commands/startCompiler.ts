/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {window} from 'vscode';
import {RelayExtensionContext} from '../context';
import {createAndStartCompiler} from '../compiler';

export function handleStartCompilerCommand(
  context: RelayExtensionContext,
): void {
  if (context.compilerTerminal) {
    window.showWarningMessage(
      'Relay Compiler already running. Restart it with relay.restart',
    );

    return;
  }

  createAndStartCompiler(context);
}
