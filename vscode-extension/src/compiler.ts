/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {window} from 'vscode';
import {RelayProjectExtensionContext} from './context';
import {getConfig} from './config';

export function createAndStartCompiler(context: RelayProjectExtensionContext) {
  if (context.project.compilerTerminal) {
    return;
  }

  const config = getConfig();

  const args: string[] = ['--watch', `--output=${config.compilerOutpuLevel}`];

  if (context.project.binaryExecutionOptions.pathToConfig) {
    args.push(context.project.binaryExecutionOptions.pathToConfig);
  }

  const terminal = window.createTerminal({
    name: 'Relay Compiler',
    cwd: context.project.binaryExecutionOptions.rootPath,
  });

  terminal.sendText(
    `${context.project.binaryExecutionOptions.binaryPath} ${args.join(' ')}`,
  );

  terminal.show();

  context.extensionContext.subscriptions.push(terminal);

  context.project.compilerTerminal = terminal;
}

type DidNotError = boolean;

export function killCompiler(
  context: RelayProjectExtensionContext,
): DidNotError {
  if (!context.project.compilerTerminal) {
    return true;
  }

  context.project.compilerTerminal.dispose();

  context.log('Successfully stopped existing relay compiler');

  context.project.compilerTerminal = null;

  return true;
}
