import { PackageManagerType } from "../../types.js";
import { CommandRunner } from "../CommandRunner.js";
import { NpmPackageManager } from "./NpmPackageManager.js";
import { PackageManager } from "./PackageManager.js";
import { PnpmPackageManager } from "./PnpmPackageManager.js";
import { YarnPackageManager } from "./YarnPackageManager.js";

export type { PackageManager } from "./PackageManager.js";

export function getPackageManger(type: PackageManagerType, cmdRunner: CommandRunner, cwd: string): PackageManager {
  switch (type) {
    case "npm":
      return new NpmPackageManager(cwd, cmdRunner);
    case "yarn":
      return new YarnPackageManager(cwd, cmdRunner);
    case "pnpm":
      return new PnpmPackageManager(cwd, cmdRunner);
  }
}

export function getExecutingPackageManager(): PackageManagerType {
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent) {
    if (userAgent.startsWith("yarn")) {
      return "yarn";
    } else if (userAgent.startsWith("pnpm")) {
      return "pnpm";
    }
  }

  return "npm";
}
