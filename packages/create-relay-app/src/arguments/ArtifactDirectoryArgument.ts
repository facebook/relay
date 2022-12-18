import { Command } from "commander";
import path from "path";
import { Environment } from "../misc/Environment.js";
import { Filesystem } from "../misc/Filesystem.js";
import { CliArguments } from "../types.js";
import { bold } from "../utils/index.js";
import { ArgumentBase } from "./ArgumentBase.js";

export class ArtifactDirectoryArgument extends ArgumentBase<"artifactDirectory"> {
  public name = "artifactDirectory" as const;
  public promptMessage = "(Optional) Where to place Relay artifacts";

  constructor(private fs: Filesystem, private env: Environment) {
    super();
    this.cliArg = "--artifact-directory";
  }

  registerCliOption(command: Command): void {
    const flags = this.getCliFlags("-a", "<path>");

    command.option(flags, "directory to place all Relay artifacts in", (value) => this.env.rel(value)?.rel);
  }

  promptForValue(existingArgs: Partial<CliArguments>): Promise<CliArguments["artifactDirectory"]> {
    return this.showInquirerPrompt(
      {
        type: "input",
        validate: (input) => this.isValid(input, existingArgs),
        filter: (input) => (input ? this.env.rel(input)?.rel || "" : ""),
      },
      existingArgs
    );
  }

  isValid(value: CliArguments["artifactDirectory"], existingArgs: Partial<CliArguments>): true | string {
    if (!value) {
      if (existingArgs.toolchain === "next") {
        return "Required";
      }

      // The artifactDirectory is optional.
      return true;
    }

    if (!this.fs.isDirectory(value)) {
      return `Must be a directory`;
    }

    if (path.basename(value) !== "__generated__") {
      return `Last directory segment should be called ${bold("__generated__")}`;
    }

    if (!this.fs.isSubDirectory(this.env.cwd, value)) {
      return `Must be directory below ${bold(this.env.cwd)}`;
    }

    if (existingArgs.toolchain === "next") {
      const pagesDirectory = this.env.rel("./pages");

      if (this.fs.isSubDirectory(pagesDirectory.abs, value)) {
        return `Can not be under ${bold(pagesDirectory.rel)}`;
      }
    }

    return true;
  }

  getDefaultValue(existingArgs: Partial<CliArguments>): Promise<CliArguments["artifactDirectory"]> {
    if (existingArgs.toolchain === "next") {
      // Artifacts need to be located outside the ./pages directory,
      // or they will be treated as pages.
      return Promise.resolve("./__generated__");
    }

    return Promise.resolve("");
  }
}
