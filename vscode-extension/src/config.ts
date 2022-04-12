/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {ConfigurationScope, workspace} from 'vscode';

export type Config = {
  pathToRelay: string | null;
  outputLevel: string;
};

export function getConfig(scope?: ConfigurationScope): Config {
  const configuration = workspace.getConfiguration('relay', scope);

  return {
    pathToRelay: configuration.get('pathToRelay') ?? null,
    outputLevel: configuration.get('outputLevel') ?? 'quiet-with-errros',
  };
}
