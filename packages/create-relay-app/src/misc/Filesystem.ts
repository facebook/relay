import path from "path";
import fs from "fs/promises";
import { existsSync, lstatSync } from "fs";
import fsExtra from "fs-extra";
import glob from "glob";

export class Filesystem {
  getParent(filepath: string): string {
    return path.dirname(filepath);
  }

  isDirectory(directoryPath: string): boolean {
    if (!this.exists(directoryPath)) {
      // If the path does not exist, we check that it doesn't
      // have a file extension to determine whether it's a
      // directory path.
      const ext = path.extname(directoryPath);

      return !ext;
    }

    return lstatSync(directoryPath).isDirectory();
  }

  isFile(filePath: string): boolean {
    if (!this.exists(filePath)) {
      // If the path does not exist, we check if it has a
      // file extension to determine whether it's a file or not.
      const ext = path.extname(filePath);

      return !!ext;
    }

    return lstatSync(filePath).isFile();
  }

  isSubDirectory(parent: string, dir: string): boolean {
    const relative = path.relative(parent, dir);

    return !relative.startsWith("..") && !path.isAbsolute(relative);
  }

  copyFile(src: string, dest: string): Promise<void> {
    return fs.copyFile(src, dest);
  }

  exists(filepath: string): boolean {
    return existsSync(filepath);
  }

  async readFromFile(filepath: string): Promise<string> {
    try {
      return await fs.readFile(filepath, "utf-8");
    } catch (error) {
      throw new ReadFromFileError(filepath, error);
    }
  }

  async writeToFile(filepath: string, content: string): Promise<void> {
    try {
      await fs.writeFile(filepath, content, "utf-8");
    } catch (error) {
      throw new WriteToFileError(filepath, error);
    }
  }

  async appendToFile(filepath: string, content: string): Promise<void> {
    try {
      await fs.appendFile(filepath, content, "utf-8");
    } catch (error) {
      throw new AppendToFileError(filepath, error);
    }
  }

  async createDirectory(directoryPath: string): Promise<void> {
    try {
      await fsExtra.mkdir(directoryPath, { recursive: true });
    } catch (error) {
      throw new CreateDirectoryError(directoryPath, error);
    }
  }
}

class CreateDirectoryError extends Error {
  constructor(path: string, cause: any) {
    super(`Failed to create directory: ${path}`, { cause });
  }
}

class WriteToFileError extends Error {
  constructor(path: string, cause: any) {
    super(`Failed to write to file: ${path}`, { cause });
  }
}

class AppendToFileError extends Error {
  constructor(path: string, cause: any) {
    super(`Failed to append to file: ${path}`, { cause });
  }
}

class ReadFromFileError extends Error {
  constructor(path: string, cause: any) {
    super(`Failed to read from file: ${path}`, { cause });
  }
}
