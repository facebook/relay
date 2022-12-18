import { spawn } from "child_process";
import { EOL } from "os";

export class CommandRunner {
  run(command: string, args: string[], cwd?: string) {
    return new Promise<void>((resolve, reject) => {
      const child = spawn(command, args, {
        cwd: cwd,
        shell: true,
      });

      let errorMsg: string = "";

      child.stderr.setEncoding("utf-8");

      child.stderr.on("data", (data) => {
        errorMsg += data;
      });

      child.on("close", (code) => {
        if (code !== 0) {
          let output = `Command \"${command} ${args.join(" ")}\" failed`;

          if (!!errorMsg) {
            output += EOL + EOL + "  " + errorMsg.split(EOL).join(EOL + "  ");
          }

          reject(output);
          return;
        }

        resolve();
      });
    });
  }
}
