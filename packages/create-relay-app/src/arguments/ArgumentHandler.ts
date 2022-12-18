import { ArgumentBase } from "./ArgumentBase.js";
import { CliArguments } from "../types.js";
import { program } from "commander";
import { Environment } from "../misc/Environment.js";

export class ArgumentHandler {
  private readonly argumentDefinitions: ArgumentBase<keyof CliArguments>[];

  constructor(argumentDefinitions: ArgumentBase<keyof CliArguments>[]) {
    this.argumentDefinitions = argumentDefinitions;
  }

  async parseArgs(env: Environment): Promise<Partial<CliArguments>> {
    const details = await env.ownPackageJson.getDetails();

    program.name(details.name).description(details.description).version(details.version, `-v, --version`);

    // Register CLI options.
    for (const argumentDefinition of this.argumentDefinitions) {
      argumentDefinition.registerCliOption(program);
    }

    program
      .option("--ignore-git-changes", "do not exit if the current directory has un-commited Git changes")
      .option("--skip-install", "skip the install of npm packages (only for testing)")
      .option(
        `-i, --interactive`,
        `display an interactive prompt that allows you to manually input your project's details`
      );

    // Parse CLI options.
    await program.parseAsync();

    const cliArgs = program.opts<Partial<CliArguments>>();

    this.validateArgs(cliArgs);

    return cliArgs;
  }

  async resolveMissingArgs(parsedArgs: Partial<CliArguments>): Promise<CliArguments> {
    const allArgs: Partial<CliArguments> = { ...parsedArgs };

    for (const argumentDefinition of this.argumentDefinitions) {
      const existingValue = parsedArgs[argumentDefinition.name];

      if (existingValue !== undefined) {
        // Value was supplied as CLI argument, we don't need to prompt for it.
        argumentDefinition.submitWithValue(existingValue);
        continue;
      }

      if (parsedArgs.interactive) {
        const answer = await argumentDefinition.promptForValue(allArgs);

        // @ts-ignore
        allArgs[argumentDefinition.name] = answer;
      } else {
        // The user does not want to be prompted, so we choose default values.
        const defaultValue = await argumentDefinition.getDefaultValue(allArgs);

        argumentDefinition.submitWithValue(defaultValue);

        // @ts-ignore
        allArgs[argumentDefinition.name] = defaultValue;
      }
    }

    this.validateArgs(allArgs);

    return allArgs as CliArguments;
  }

  private validateArgs(args: Partial<CliArguments>) {
    for (const argumentDefinition of this.argumentDefinitions) {
      const value = args[argumentDefinition.name];

      if (value === undefined) {
        continue;
      }

      const successOrErrorReason = argumentDefinition.isValid(value, args);

      if (successOrErrorReason === true) {
        continue;
      }

      throw argumentDefinition.getInvalidArgError(value, undefined, successOrErrorReason);
    }
  }
}
