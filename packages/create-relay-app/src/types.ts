export const ToolchainOptions = ["cra", "next", "vite"] as const;
export const PackageManagerOptions = ["npm", "yarn", "pnpm"] as const;

export type ToolchainType = typeof ToolchainOptions[number];
export type PackageManagerType = typeof PackageManagerOptions[number];

export type RelayCompilerLanguage = "javascript" | "typescript" | "flow";

export type CliArguments = {
  toolchain: ToolchainType;
  typescript: boolean;
  subscriptions: boolean;
  schemaFile: string;
  src: string;
  artifactDirectory: string;
  packageManager: PackageManagerType;
  ignoreGitChanges: boolean;
  skipInstall: boolean;
  interactive: boolean;
};
