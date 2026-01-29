/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {commands} from 'vscode';
import {RelayExtensionContext} from '../context';
import {handleRestartLanguageServerCommand} from './restart';
import {handleShowOutputCommand} from './showOutput';
import {handleStartCompilerCommand} from './startCompiler';
import {handleStopCompilerCommand} from './stopCompiler';
import {handleCopyOperation} from './copyOperation';

export function registerCommands(context: RelayExtensionContext) {
  context.extensionContext.subscriptions.push(
    commands.registerCommand(
      'relay.startCompiler',
      handleStartCompilerCommand.bind(null, context),
    ),
    commands.registerCommand(
      'relay.stopCompiler',
      handleStopCompilerCommand.bind(null, context),
    ),
    commands.registerCommand(
      'relay.restart',
      handleRestartLanguageServerCommand.bind(null, context),
    ),
    commands.registerCommand(
      'relay.showOutput',
      handleShowOutputCommand.bind(null, context),
    ),
    commands.registerCommand(
      'relay.copyOperation',
      handleCopyOperation.bind(null, context),
    ),
  );
}
