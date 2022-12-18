import { Command } from "commander";
import path from "path";
import { NEXT_SRC_PATH } from "../consts.js";
import { Environment } from "../misc/Environment.js";
import { Filesystem } from "../misc/Filesystem.js";
import { CliArguments } from "../types.js";
import { bold } from "../utils/index.js";
import { ArgumentBase } from "./ArgumentBase.js";

export class SchemaFileArgument extends ArgumentBase<"schemaFile"> {
  public name = "schemaFile" as const;
  public promptMessage = "Where's your GraphQL schema file";

  constructor(private fs: Filesystem, private env: Environment) {
    super();
    this.cliArg = "--schema-file";
  }

  registerCliOption(command: Command): void {
    const flags = this.getCliFlags("-f", "<path>");

    command.option(flags, "path to a GraphQL schema file", (value) => this.env.rel(value)?.rel);
  }

  promptForValue(existingArgs: Partial<CliArguments>): Promise<CliArguments["schemaFile"]> {
    return this.showInquirerPrompt(
      {
        type: "input",
        validate: (input) => this.isValid(input, existingArgs),
        filter: (input) => this.env.rel(input)?.rel || "",
      },
      existingArgs
    );
  }

  isValid(value: CliArguments["schemaFile"], existingArgs: Partial<CliArguments>): true | string {
    if (!value) {
      return "Required";
    }

    const graphqlExt = ".graphql";

    const filename = path.basename(value);

    if (!filename.endsWith(graphqlExt)) {
      return `File needs to end in ${bold(graphqlExt)}`;
    }

    if (!this.fs.isFile(value)) {
      return `Must be a file`;
    }

    if (!this.fs.isSubDirectory(this.env.cwd, value)) {
      return `Must be a file somewhere below ${bold(this.env.cwd)}`;
    }

    return true;
  }

  getDefaultValue(existingArgs: Partial<CliArguments>): Promise<CliArguments["schemaFile"]> {
    const filename = "schema.graphql";

    let srcPath: string = existingArgs.src!;

    if (existingArgs.toolchain === "next") {
      srcPath = NEXT_SRC_PATH;
    }

    const filepath = path.join(srcPath, filename);

    return Promise.resolve(this.env.rel(filepath).rel);
  }
}
