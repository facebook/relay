/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {ConfigurationScope, workspace} from 'vscode';

export type RelayProjectConfig = {
  name: string;
  pathToConfig: string | null;
  rootDirectory: string | null;
  autoStartCompiler: boolean;
};

export type Config = {
  projects: RelayProjectConfig[] | null;
  pathToRelay: string | null;
  lspOutputLevel: string;
  compilerOutputLevel: string;
};

export function getConfig(scope?: ConfigurationScope): Config {
  const configuration = workspace.getConfiguration('relay', scope);

  // If a user has the 'pathToConfig' and 'rootDirectory' settings set, but doesn't have
  // the 'projects' config set, we just map those values into a project config to make downstream
  // code easier to reason about. This basically makes the internals of the
  let projects = configuration.get<RelayProjectConfig[] | null | undefined>(
    'projects',
  );
  const pathToConfig = configuration.get<string | null | undefined>(
    'pathToConfig',
  );
  const rootDirectory = configuration.get<string | null | undefined>(
    'rootDirectory',
  );
  const autoStartCompiler =
    configuration.get<boolean | null | undefined>('autoStartCompiler') ?? false;
  if (!Array.isArray(projects) && (pathToConfig || rootDirectory)) {
    projects = [
      {
        name: 'default',
        pathToConfig: pathToConfig ?? null,
        rootDirectory: rootDirectory ?? null,
        autoStartCompiler: Boolean(autoStartCompiler),
      },
    ];
  }

  const finalConfig: Config = {
    pathToRelay: configuration.get('pathToRelay') ?? null,
    compilerOutputLevel: configuration.get('compilerOutputLevel') ?? 'info',
    lspOutputLevel: configuration.get('lspOutputLevel') ?? 'quiet-with-errros',
    // Make sure the autoStartCompiler setting is explicitly set to a boolean either from the project config or the global setting
    projects: projects
      ? projects.map(project => ({
          ...project,
          autoStartCompiler:
            typeof project.autoStartCompiler === 'boolean'
              ? project.autoStartCompiler
              : autoStartCompiler,
        }))
      : null,
  };

  console.log(finalConfig);

  return finalConfig;
}
