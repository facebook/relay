import ora from "ora";
import { dim } from "../utils/cli.js";
import { TaskBase, TaskSkippedError } from "./TaskBase.js";

export class TaskRunner {
  constructor(private taskDefs: (false | TaskBase)[]) {}

  async run(): Promise<void> {
    let hadError = false;

    for (let i = 0; i < this.taskDefs.length; i++) {
      const task = this.taskDefs[i];

      if (!task || !task.isEnabled()) {
        continue;
      }

      const spinner = ora(task.message);

      task.onUpdateMessage = (msg) => (spinner.text = msg);

      try {
        spinner.start();

        await task.run();

        spinner.succeed();
      } catch (error) {
        if (error instanceof TaskSkippedError) {
          const reason = error.reason ? ": " + error.reason : "";

          spinner.warn(spinner.text + " " + dim(`[Skipped${reason}]`));

          continue;
        }

        let errorMsg: string | undefined = undefined;

        if (!!error) {
          if (typeof error === "string") {
            errorMsg = error;
          } else if (error instanceof Error) {
            errorMsg = error.message;
          }
        }

        spinner.fail();

        if (errorMsg) {
          console.log();
          console.log("  " + errorMsg);
          console.log();
        }

        if (!hadError) {
          hadError = true;
        }
      }
    }

    if (hadError) {
      throw new Error();
    }
  }
}
