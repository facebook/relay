/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {ConfigurationScope, workspace} from 'vscode';

export type Config = {
  rootDirectory: string | null;
  pathToRelay: string | null;
  pathToConfig: string | null;
  lspOutputLevel: string;
  compilerOutpuLevel: string;
  autoStartCompiler: boolean;
};

export function getConfig(scope?: ConfigurationScope): Config {
  const configuration = workspace.getConfiguration('relay', scope);

  return {
    pathToRelay: configuration.get('pathToRelay') ?? null,
    pathToConfig: configuration.get('pathToConfig') ?? null,
    lspOutputLevel: configuration.get('lspOutputLevel') ?? 'quiet-with-errros',
    compilerOutpuLevel: configuration.get('compilerOutputLevel') ?? 'info',
    rootDirectory: configuration.get('rootDirectory') ?? null,
    autoStartCompiler: configuration.get('autoStartCompiler') ?? false,
  };
}
