import { Filesystem } from "./Filesystem.js";

type PackageDetails = Readonly<{
  name: string;
  version: string;
  description: string;
}>;

export class PackageJsonFile {
  constructor(private filepath: string, private fs: Filesystem) {}

  async parse(): Promise<Record<string, any>> {
    const packageJsonContent = await this.fs.readFromFile(this.filepath);

    const packageJson: Record<string, any> = JSON.parse(packageJsonContent);

    return packageJson;
  }

  async persist(content: Record<string, any>): Promise<void> {
    const serializedPackageJson = JSON.stringify(content, null, 2);

    await this.fs.writeToFile(this.filepath, serializedPackageJson);
  }

  async getDetails(): Promise<PackageDetails> {
    const packageJson = await this.parse();

    const name = packageJson?.name;

    if (!name) {
      throw new Error(`Could not determine name in ${this.filepath}`);
    }

    const version = packageJson?.version;

    if (!version) {
      throw new Error(`Could not determine version in ${this.filepath}`);
    }

    const description = packageJson?.description;

    if (!description) {
      throw new Error(`Could not determine description in ${this.filepath}`);
    }

    return { name, version, description };
  }

  async containsDependency(packageName: string): Promise<boolean> {
    try {
      const content = await this.parse();

      const dependencies: Record<string, string> = content["dependencies"] ?? {};
      const devDpendencies: Record<string, string> = content["devDependencies"] ?? {};

      const installedPackages = Object.keys({
        ...dependencies,
        ...devDpendencies,
      });

      return installedPackages.includes(packageName);
    } catch {
      return false;
    }
  }
}
