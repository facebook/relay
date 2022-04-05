import { workspace } from "vscode";

export type Config = {
  pathToRelay: string | null;
  outputLevel: string;
}

export function getConfig(): Config {
  const configuration = workspace.getConfiguration('relay');

  return {
    pathToRelay: configuration.get('pathToRelay'),
    outputLevel: configuration.get('outputLevel'),
  };
}