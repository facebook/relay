import chalk from "chalk";
import { Command } from "commander";
import inquirer from "inquirer";
import { CliArguments } from "../types.js";

type PromptOptions<TName extends keyof CliArguments> = {
  type: "list" | "confirm" | "input";
  choices?: readonly CliArguments[TName][];
  validate?(input: CliArguments[TName]): true | string;
  filter?(input: string): CliArguments[TName];
};

export abstract class ArgumentBase<TName extends keyof CliArguments> {
  public abstract readonly name: TName;
  public abstract readonly promptMessage: string;

  private _cliArg?: string;

  get cliArg(): string {
    return this._cliArg ?? "--" + this.name;
  }

  protected set cliArg(value: string) {
    this._cliArg = value;
  }

  abstract registerCliOption(command: Command): void;

  abstract promptForValue(existingArgs: Partial<CliArguments>): Promise<CliArguments[TName]>;

  abstract getDefaultValue(existingArgs: Partial<CliArguments>): Promise<CliArguments[TName]>;

  abstract isValid(value: CliArguments[TName], existingArgs: Partial<CliArguments>): true | string;

  submitWithValue(value: CliArguments[TName]) {
    let val = value;

    if (val === null || (typeof val === "string" && !val)) {
      val = chalk.italic("empty") as CliArguments[TName];
    } else if (typeof value === "boolean") {
      val = (!!value ? "Yes" : "No") as CliArguments[TName];
    }

    console.log(`${chalk.green("?")} ${this.promptMessage} ${chalk.cyan(val)}`);
  }

  getInvalidArgError(
    value: any,
    validValues?: readonly CliArguments[TName][] | CliArguments[TName],
    reason?: string
  ): Error {
    let msg = `Received an invalid value for ${this.cliArg}: \"${value}\".`;

    if (validValues) {
      const validValueString: string =
        validValues instanceof Array
          ? validValues.join(", ")
          : typeof validValues === "string"
          ? validValues
          : validValues.toString();

      msg += " Valid values are: " + validValueString + ".";
    } else if (reason) {
      msg += " " + reason;
    }

    return new InvalidArgError(msg);
  }

  protected getCliFlags(shorthand?: string, argument?: string) {
    let flags: string = "";

    if (shorthand) {
      flags += shorthand + ", ";
    }

    flags += this.cliArg;

    if (argument) {
      flags += " " + argument;
    }

    return flags;
  }

  protected async showInquirerPrompt(
    options: PromptOptions<TName>,
    existingArgs: Partial<CliArguments>
  ): Promise<CliArguments[TName]> {
    const defaultValue = await this.getDefaultValue(existingArgs);

    const answer = await inquirer.prompt({
      name: this.name,
      message: this.promptMessage,
      default: defaultValue,
      ...options,
    });

    return answer[this.name];
  }
}

export function getNormalizedCliString(input?: string): string {
  return input?.toLowerCase().trim() || "";
}

export class InvalidArgError extends Error {}
