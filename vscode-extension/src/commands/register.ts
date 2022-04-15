/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {commands} from 'vscode';
import {RelayExtensionContext} from '../context';
import {handleRestartLanguageServerCommand} from './restartLanguageServer';
import {handleShowOutputCommand} from './showOutput';

export function registerCommands(context: RelayExtensionContext) {
  context.extensionContext.subscriptions.push(
    commands.registerCommand(
      'relay.restartLanguageServer',
      handleRestartLanguageServerCommand.bind(null, context),
    ),
    commands.registerCommand(
      'relay.showOutput',
      handleShowOutputCommand.bind(null, context),
    ),
  );
}
