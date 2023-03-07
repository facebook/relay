/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {ConfigurationScope, workspace} from 'vscode';

export type RelayProjectConfig = {
  name: string;
  pathToConfig: string;
  rootDirectory: string | null;
};

export type Config = {
  projects: RelayProjectConfig[] | null;
  pathToRelay: string | null;
  lspOutputLevel: string;
  compilerOutputLevel: string;
  autoStartCompiler: boolean;
};

export function getConfig(scope?: ConfigurationScope): Config {
  const configuration = workspace.getConfiguration('relay', scope);

  // Support backward compatibility for existing configs. If a user has the 'pathToConfig'
  // and 'rootDirectory' settings set, but doesn't have the 'projects' config set, map
  // those values over to the new expected config.
  let projects: RelayProjectConfig[] | null | undefined =
    configuration.get('projects');
  const pathToConfig: string | null | undefined =
    configuration.get('pathToConfig');
  const rootDirectory: string | null | undefined =
    configuration.get('rootDirectory');
  if (!Array.isArray(projects) && pathToConfig && rootDirectory) {
    projects = [
      {
        name: 'default',
        pathToConfig,
        rootDirectory,
      },
    ];
  }

  return {
    projects: projects ?? null,
    pathToRelay: configuration.get('pathToRelay') ?? null,
    autoStartCompiler: configuration.get('autoStartCompiler') ?? false,
    compilerOutputLevel: configuration.get('compilerOutputLevel') ?? 'info',
    lspOutputLevel: configuration.get('lspOutputLevel') ?? 'quiet-with-errros',
  };
}
