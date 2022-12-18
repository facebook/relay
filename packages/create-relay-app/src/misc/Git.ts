import { exec } from "child_process";

export class Git {
  async isGitRepository(directory: string): Promise<boolean> {
    return await new Promise<boolean>((resolve) => {
      exec("git rev-parse --is-inside-work-tree", { cwd: directory }, (error) => {
        resolve(!error);
      });
    });
  }

  async hasUnsavedChanges(directory: string): Promise<boolean> {
    const hasUnsavedChanges = await new Promise<boolean>((resolve) => {
      exec("git status --porcelain", { cwd: directory }, (error, stdout) => {
        resolve(!!error || !!stdout);
      });
    });

    return hasUnsavedChanges;
  }
}
