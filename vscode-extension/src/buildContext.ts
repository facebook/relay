import path = require('path');
import {ExtensionContext, window, workspace} from 'vscode';
import {getConfig} from './config';
import {RelayExtensionContext, RelayProject} from './context';
import {createStatusBarItem} from './statusBarItem';
import {findRelayBinaryWithWarnings} from './utils/findRelayBinary';

export async function buildRelayExtensionContext(
  extensionContext: ExtensionContext,
): Promise<RelayExtensionContext | null> {
  const config = getConfig();

  const statusBar = createStatusBarItem();
  const outputChannel = window.createOutputChannel('Relay');

  const relayLog = (message: string) => {
    outputChannel.appendLine(`[Relay] — ${message}`);
  };

  extensionContext.subscriptions.push(statusBar);
  extensionContext.subscriptions.push(outputChannel);

  const projects: RelayProject[] = [];

  if (config.projects) {
    await Promise.all(
      config.projects.map(async projectConfig => {
        const projectLog = (message: string) => {
          outputChannel.appendLine(`[${projectConfig.name}] — ${message}`);
        };

        const project = await buildRelayProject({
          ...projectConfig,
          extensionContext,
          projectLog,
        });

        if (project) {
          projects.push(project);
        } else {
          projectLog(
            'Ignoring project since we could not find the relay-compiler binary',
          );
        }
      }),
    );
  } else {
    const project = await buildRelayProject({
      name: 'default',
      pathToConfig: null,
      rootDirectory: null,
      extensionContext,
      projectLog: relayLog,
    });

    if (project) {
      projects.push(project);
    }
  }

  const ableToBuildAtLeastOneProject = Object.keys(projects).length > 0;

  if (ableToBuildAtLeastOneProject) {
    return {
      projects,
      statusBar,
      extensionContext,
      log: relayLog,
      _outputChannel: outputChannel,
    };
  }

  relayLog(
    'Stopping execution of the Relay VSCode extension since we could not find a valid compiler for any of your defined projects.',
  );

  return null;
}

type BuildRelayProjectArgs = {
  name: string;
  rootDirectory: string | null;
  pathToConfig: string | null;
  extensionContext: ExtensionContext;
  projectLog: (message: string) => void;
};

async function buildRelayProject({
  name,
  pathToConfig,
  rootDirectory,
  extensionContext,
  projectLog,
}: BuildRelayProjectArgs): Promise<RelayProject | null> {
  let rootPath = workspace.rootPath || process.cwd();
  if (rootDirectory) {
    rootPath = path.join(rootPath, rootDirectory);
  }

  const binaryPath = await findRelayBinaryWithWarnings(projectLog, rootPath);

  if (binaryPath) {
    const lspOutputChannel = window.createOutputChannel(
      `Relay LSP Logs - ${name}`,
    );
    extensionContext.subscriptions.push(lspOutputChannel);

    return {
      lspOutputChannel,
      name,
      compilerTerminal: null,
      client: null,
      binaryExecutionOptions: {
        rootPath,
        binaryPath,
        pathToConfig,
      },
    };
  }

  return null;
}
