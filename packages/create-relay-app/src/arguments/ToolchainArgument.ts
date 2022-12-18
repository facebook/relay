import { Command } from "commander";
import { Environment } from "../misc/Environment.js";
import { CliArguments, ToolchainType, ToolchainOptions } from "../types.js";
import { ArgumentBase, getNormalizedCliString } from "./ArgumentBase.js";

export class ToolchainArgument extends ArgumentBase<"toolchain"> {
  public name = "toolchain" as const;
  public promptMessage = "What's the toolchain of your project";

  constructor(private env: Environment) {
    super();
  }

  registerCliOption(command: Command): void {
    const flags = this.getCliFlags("-t", "<toolchain>");

    command.option(flags, "the toolchain used to bundle / serve the project", (value) => this.parseToolChain(value));
  }

  promptForValue(existingArgs: Partial<CliArguments>): Promise<ToolchainType> {
    return this.showInquirerPrompt(
      {
        type: "list",
        choices: ToolchainOptions,
      },
      existingArgs
    );
  }

  isValid(value: ToolchainType, existingArgs: Partial<CliArguments>): true | string {
    return true;
  }

  async getDefaultValue(existingArgs: Partial<CliArguments>): Promise<ToolchainType> {
    if (await this.env.packageJson.containsDependency("next")) {
      return "next";
    }

    if (await this.env.packageJson.containsDependency("vite")) {
      return "vite";
    }

    return "cra";
  }

  parseToolChain(rawInput?: string): ToolchainType | null {
    if (!rawInput) {
      return null;
    }

    const input = getNormalizedCliString(rawInput);

    if (input === "next") {
      return "next";
    }

    if (input === "vite") {
      return "vite";
    }

    if (input === "cra") {
      return "cra";
    }

    throw this.getInvalidArgError(input, ToolchainOptions);
  }
}
