/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {ExtensionContext, OutputChannel, StatusBarItem, Terminal} from 'vscode';
import {LanguageClient} from 'vscode-languageclient/node';

export type BinaryExecutionOptions = {
  rootPath: string;
  binaryPath: string;
  pathToConfig: string | null;
};

export type RelayProject = {
  name: string;
  client: LanguageClient | null;
  binaryExecutionOptions: BinaryExecutionOptions;
  compilerTerminal: Terminal | null;
  lspOutputChannel: OutputChannel;
};

// Mutable object to pass around to command handlers so they
// can reference the current state of the extension
//
// Things like configuration should not be stored in this context
// as they should be resolved contextually (workspace, file, etc).
// This state is global to the entire extension.
// At some point, we'll most likely have a map of Workspace => LSP Client
// for downstream callers to use.
//
// We're not using the VSCode's API for this since that state must be serializable
// as it's persisted to disk.
// https://code.visualstudio.com/api/extension-capabilities/common-capabilities#data-storage
export type RelayExtensionContext = {
  statusBar: StatusBarItem;
  extensionContext: ExtensionContext;

  /**
   * This should only be used for APIs that need an `OutputChannel`.
   * please use `log` instead
   */
  _outputChannel: OutputChannel;

  log: (message: string) => void;

  projects: RelayProject[];
};

// Take the `RelayExtensionContext` type and replace `projects` with a singular `project`
export type RelayProjectExtensionContext = Omit<
  RelayExtensionContext,
  'projects'
> & {
  log: (message: string) => void;
  project: RelayProject;
};

export function createProjectContextFromExtensionContext(
  extensionContext: RelayExtensionContext,
  project: RelayProject,
): RelayProjectExtensionContext {
  const {
    // We're discarding project to build the project extension context
    // eslint-disable-next-line @typescript-eslint/naming-convention
    projects: _,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _outputChannel,
    ...rest
  } = extensionContext;

  const projectContext: RelayProjectExtensionContext = {
    ...rest,
    project,
    _outputChannel,
    log: message => {
      // Using output channel directly here to avoid using parent formatting
      _outputChannel.appendLine(`[Relay][${project.name}] — ${message}`);
    },
  };

  return projectContext;
}
