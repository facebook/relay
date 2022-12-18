import { execSync } from "child_process";
import { Command } from "commander";
import { Environment } from "../misc/Environment.js";
import { Filesystem } from "../misc/Filesystem.js";
import { getExecutingPackageManager } from "../misc/packageManagers/index.js";
import { CliArguments, PackageManagerType, PackageManagerOptions } from "../types.js";
import { ArgumentBase, getNormalizedCliString } from "./ArgumentBase.js";

export class PackageManagerArgument extends ArgumentBase<"packageManager"> {
  public name = "packageManager" as const;
  public promptMessage = "What package manager to install packages with";

  constructor(private fs: Filesystem, private env: Environment) {
    super();
    this.cliArg = "--package-manager";
  }

  registerCliOption(command: Command): void {
    const flags = this.getCliFlags("-p", "<manager>");

    command.option(flags, "the package manager to use for installing packages", (value) =>
      this.parsePackageManager(value)
    );
  }

  promptForValue(existingArgs: Partial<CliArguments>): Promise<PackageManagerType> {
    return this.showInquirerPrompt(
      {
        type: "list",
        choices: PackageManagerOptions,
      },
      existingArgs
    );
  }

  isValid(value: PackageManagerType, existingArgs: Partial<CliArguments>): true | string {
    return true;
  }

  getDefaultValue(existingArgs: Partial<CliArguments>): Promise<PackageManagerType> {
    const yarnLockFile = this.env.rel("yarn.lock");

    if (this.fs.exists(yarnLockFile.abs)) {
      try {
        execSync("yarn --version", { stdio: "ignore" });

        // Project has a yarn.lock file and yarn is installed.
        return Promise.resolve("yarn");
      } catch {}
    }

    const pnpmLockFile = this.env.rel("pnpm-lock.yaml");

    if (this.fs.exists(pnpmLockFile.abs)) {
      try {
        execSync("pnpm --version", { stdio: "ignore" });

        // Project has a pnpm-lock.yaml file and pnpm is installed.
        return Promise.resolve("pnpm");
      } catch {}
    }

    const executingPackageManager = getExecutingPackageManager();

    return Promise.resolve(executingPackageManager);
  }

  parsePackageManager(rawInput?: string): PackageManagerType | null {
    if (!rawInput) {
      return null;
    }

    const input = getNormalizedCliString(rawInput);

    if (input === "yarn") {
      return "yarn";
    }

    if (input === "pnpm") {
      return "pnpm";
    }

    if (input === "npm") {
      return "npm";
    }

    throw this.getInvalidArgError(input, PackageManagerOptions);
  }
}
