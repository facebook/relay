/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {ConfigurationScope, workspace} from 'vscode';

type RelayProject = {
  name: string;
  pathToConfig: string;
  rootDirectory: string | null;
};

export type Config = {
  projects: RelayProject[];
  pathToRelay: string | null;
  lspOutputLevel: string;
  compilerOutpuLevel: string;
  autoStartCompiler: boolean;
};

export function getConfig(scope?: ConfigurationScope): Config {
  const configuration = workspace.getConfiguration('relay', scope);

  return {
    projects: configuration.get('projects') ?? [],
    pathToRelay: configuration.get('pathToRelay') ?? null,
    autoStartCompiler: configuration.get('autoStartCompiler') ?? false,
    compilerOutpuLevel: configuration.get('compilerOutputLevel') ?? 'info',
    lspOutputLevel: configuration.get('lspOutputLevel') ?? 'quiet-with-errros',
  };
}
