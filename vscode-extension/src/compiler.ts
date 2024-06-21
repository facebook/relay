/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {window} from 'vscode';
import {RelayExtensionContext} from './context';
import {getConfig} from './config';

export function createAndStartCompiler(context: RelayExtensionContext) {
  if (context.compilerTerminal) {
    return;
  }

  const config = getConfig();

  const args: string[] = ['--watch', `--output=${config.compilerOutpuLevel}`];

  if (config.pathToConfig) {
    args.push(config.pathToConfig);
  }

  const terminal = window.createTerminal({
    name: 'Relay Compiler',
    cwd: context.relayBinaryExecutionOptions.rootPath,
  });

  terminal.sendText(
    `${context.relayBinaryExecutionOptions.binaryPath} ${args.join(' ')}`,
  );

  terminal.show();

  context.extensionContext.subscriptions.push(terminal);

  context.compilerTerminal = terminal;
}

type DidNotError = boolean;

export function killCompiler(context: RelayExtensionContext): DidNotError {
  if (!context.compilerTerminal) {
    return true;
  }

  context.compilerTerminal.dispose();

  context.primaryOutputChannel.appendLine(
    'Successfully stopped existing relay compiler',
  );

  context.compilerTerminal = null;

  return true;
}
