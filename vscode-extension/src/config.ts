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
