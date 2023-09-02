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
  Object.values(context.projects).forEach(project => {
    const projectContext = createProjectContextFromExtensionContext(
      context,
      project,
    );

    if (!project.autoStartCompiler) {
      context.log(
        [
          `Not starting the Relay Compiler for the '${project.name}' project.`,
          'Please enable {project}.autoStartCompiler in your settings if you want the compiler to start when you open this project.',
        ].join(' '),
      );
    }

    createAndStartLanguageClient(projectContext);

    if (project.autoStartCompiler) {
      createAndStartCompiler(projectContext);
    }
  });
}
