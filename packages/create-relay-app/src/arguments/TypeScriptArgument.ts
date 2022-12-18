import { Command } from "commander";
import { TS_CONFIG_FILE, TYPESCRIPT_PACKAGE } from "../consts.js";
import { Environment } from "../misc/Environment.js";
import { Filesystem } from "../misc/Filesystem.js";
import { CliArguments } from "../types.js";
import { ArgumentBase } from "./ArgumentBase.js";

export class TypeScriptArgument extends ArgumentBase<"typescript"> {
  public name = "typescript" as const;
  public promptMessage = "Does your project use TypeScript";

  constructor(private fs: Filesystem, private env: Environment) {
    super();
  }

  registerCliOption(command: Command): void {
    const flags = this.getCliFlags();

    command.option(flags, "use TypeScript");
  }

  promptForValue(existingArgs: Partial<CliArguments>): Promise<boolean> {
    return this.showInquirerPrompt(
      {
        type: "confirm",
      },
      existingArgs
    );
  }

  isValid(value: boolean, existingArgs: Partial<CliArguments>): true | string {
    return true;
  }

  async getDefaultValue(existingArgs: Partial<CliArguments>): Promise<boolean> {
    const tsconfigFile = this.env.rel(TS_CONFIG_FILE);

    if (this.fs.exists(tsconfigFile.abs)) {
      return true;
    }

    const typescriptInstalled = await this.env.packageJson.containsDependency(TYPESCRIPT_PACKAGE);

    if (typescriptInstalled) {
      return true;
    }

    return false;
  }
}
