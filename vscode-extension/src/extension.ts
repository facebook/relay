/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path = require('path');
import {ExtensionContext, window, workspace} from 'vscode';
import {registerCommands} from './commands/register';
import {createAndStartCompiler} from './compiler';
import {getConfig} from './config';

import {
  createProjectContextFromExtensionContext,
  RelayExtensionContext,
  RelayProject,
} from './context';
import {createAndStartLanguageClient} from './languageClient';
import {createStatusBarItem, intializeStatusBarItem} from './statusBarItem';
import {findRelayBinaryWithWarnings} from './utils/findRelayBinary';

async function buildRelayExtensionContext(
  extensionContext: ExtensionContext,
): Promise<RelayExtensionContext | null> {
  const config = getConfig();

  const statusBar = createStatusBarItem();
  const primaryOutputChannel = window.createOutputChannel('Relay');

  extensionContext.subscriptions.push(statusBar);
  extensionContext.subscriptions.push(primaryOutputChannel);

  const projects: RelayProject[] = [];
  if (config.projects) {
    for (const project of config.projects) {
      let rootPath = workspace.rootPath || process.cwd();
      if (project.rootDirectory) {
        rootPath = path.join(rootPath, project.rootDirectory);
      }

      const binaryPath = await findRelayBinaryWithWarnings(
        primaryOutputChannel,
        rootPath,
      );

      if (binaryPath) {
        const lspOutputChannel = window.createOutputChannel(
          `Relay LSP Logs - ${project.name}`,
        );
        extensionContext.subscriptions.push(lspOutputChannel);

        projects.push({
          lspOutputChannel,
          name: project.name,
          compilerTerminal: null,
          client: null,
          binaryExecutionOptions: {
            rootPath,
            binaryPath,
            pathToConfig: project.pathToConfig,
          },
        });
      } else {
        primaryOutputChannel.appendLine(
          `Ignoring project: ${project.name} since we could not find the relay-compiler binary`,
        );
      }
    }
  } else {
    const rootPath = workspace.rootPath || process.cwd();

    const binaryPath = await findRelayBinaryWithWarnings(
      primaryOutputChannel,
      rootPath,
    );

    if (binaryPath) {
      const lspOutputChannel = window.createOutputChannel('Relay LSP Logs');
      extensionContext.subscriptions.push(lspOutputChannel);

      projects.push({
        lspOutputChannel,
        name: 'default',
        client: null,
        compilerTerminal: null,
        binaryExecutionOptions: {
          rootPath,
          binaryPath,
          pathToConfig: null,
        },
      });
    }
  }

  const ableToBuildAtLeastOneProject = Object.keys(projects).length > 0;

  if (ableToBuildAtLeastOneProject) {
    return {
      projects,
      statusBar,
      extensionContext,
      primaryOutputChannel,
    };
  }

  primaryOutputChannel.appendLine(
    'Stopping execution of the Relay VSCode extension since we could not find a valid compiler for any of your defined projects.',
  );

  return null;
}

export async function activate(extensionContext: ExtensionContext) {
  const relayExtensionContext = await buildRelayExtensionContext(
    extensionContext,
  );

  if (relayExtensionContext) {
    relayExtensionContext.primaryOutputChannel.appendLine(
      'Starting the Relay GraphQL extension...',
    );

    intializeStatusBarItem(relayExtensionContext);
    registerCommands(relayExtensionContext);

    startProjects(relayExtensionContext);
  }
}

function startProjects(context: RelayExtensionContext): void {
  const config = getConfig();

  if (!config.autoStartCompiler) {
    context.primaryOutputChannel.appendLine(
      [
        'Not starting the Relay Compiler.',
        'Please enable relay.autoStartCompiler in your settings if you want the compiler to start when you open your project.',
      ].join(' '),
    );
  }

  for (const project of Object.values(context.projects)) {
    const projectContext = createProjectContextFromExtensionContext(
      context,
      project,
    );

    createAndStartLanguageClient(projectContext);

    if (config.autoStartCompiler) {
      createAndStartCompiler(projectContext);
    }
  }
}
