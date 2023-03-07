/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {ExtensionContext} from 'vscode';
import {buildRelayExtensionContext} from './buildContext';
import {registerCommands} from './commands/register';
import {createAndStartCompiler} from './compiler';
import {getConfig} from './config';

import {
  createProjectContextFromExtensionContext,
  RelayExtensionContext,
} from './context';
import {createAndStartLanguageClient} from './languageClient';
import {intializeStatusBarItem} from './statusBarItem';

export async function activate(extensionContext: ExtensionContext) {
  const relayExtensionContext = await buildRelayExtensionContext(
    extensionContext,
  );

  if (relayExtensionContext) {
    relayExtensionContext.log('Starting the Relay GraphQL extension...');

    intializeStatusBarItem(relayExtensionContext);
    registerCommands(relayExtensionContext);

    startProjects(relayExtensionContext);
  }
}

function startProjects(context: RelayExtensionContext): void {
  const config = getConfig();

  if (!config.autoStartCompiler) {
    context.log(
      [
        'Not starting the Relay Compiler.',
        'Please enable relay.autoStartCompiler in your settings if you want the compiler to start when you open your project.',
      ].join(' '),
    );
  }

  Object.values(context.projects).forEach(project => {
    const projectContext = createProjectContextFromExtensionContext(
      context,
      project,
    );

    createAndStartLanguageClient(projectContext);

    if (config.autoStartCompiler) {
      createAndStartCompiler(projectContext);
    }
  });
}
