import { PackageManagerType } from "../../types.js";

export interface PackageManager {
  readonly id: PackageManagerType;

  addDependency(packages: string[] | string): Promise<void>;

  addDevDependency(packages: string[] | string): Promise<void>;
}
