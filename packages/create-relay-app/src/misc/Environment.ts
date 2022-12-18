import path from "path";
import { PACKAGE_FILE } from "../consts.js";
import { Filesystem } from "./Filesystem.js";
import { PackageJsonFile } from "./PackageJsonFile.js";
import { RelativePath } from "./RelativePath.js";

export class Environment {
  constructor(public readonly cwd: string, ownPackageJsonFilepath: string, private readonly fs: Filesystem) {
    this.ownPackageDirectory = fs.getParent(ownPackageJsonFilepath);
    this.ownPackageJson = new PackageJsonFile(ownPackageJsonFilepath, this.fs);
  }

  async init(): Promise<void> {
    const packageJsonFilepath = path.join(this.cwd, PACKAGE_FILE);

    if (!this.fs.exists(packageJsonFilepath)) {
      throw new MissingPackageJsonError();
    }

    this.packageJson = new PackageJsonFile(packageJsonFilepath, this.fs);
  }

  rel(relPath: string | undefined): RelativePath {
    return new RelativePath(this.cwd, relPath);
  }

  ownPackageDirectory: string;
  ownPackageJson: PackageJsonFile;
  packageJson: PackageJsonFile = null!;
}

export class MissingPackageJsonError extends Error {}
