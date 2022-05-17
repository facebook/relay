/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { spawn } from 'child_process';
import { window } from 'vscode';
import { RelayExtensionContext } from './context';
import { getConfig } from './config';

export function createAndStartCompiler(context: RelayExtensionContext) {
  const config = getConfig();

  const args: string[] = ['--watch', `--output=${config.compilerOutpuLevel}`];

  if (config.pathToConfig) {
    args.push(config.pathToConfig);
  }

  context.primaryOutputChannel.appendLine(
    [
      'Starting the Relay Compiler with the following command:',
      `${context.relayBinaryExecutionOptions.binaryPath} ${args.join(' ')}`,
    ].join(' '),
  );

  const process = spawn(context.relayBinaryExecutionOptions.binaryPath, args, {
    cwd: context.relayBinaryExecutionOptions.rootPath,
  });

  process.stdout.on('data', (data) => {
    context.primaryOutputChannel.append(`${data}`);
  });

  process.stderr.on('data', (data) => {
    context.primaryOutputChannel.append(`${data}`);
  });

  context.compilerProcess = process;
}

type DidNotError = boolean;

export function killCompiler(context: RelayExtensionContext): DidNotError {
  if (!context.compilerProcess) {
    return true;
  }

  const killedCompilerSuccessfully = context.compilerProcess.kill();

  if (!killedCompilerSuccessfully) {
    window.showErrorMessage(
      'An error occurred while trying to stop the Relay Compiler. Try restarting VSCode.',
    );

    return false;
  }

  context.primaryOutputChannel.appendLine(
    'Successfully stopped existing relay compiler',
  );

  context.compilerProcess = null;

  return true;
}
