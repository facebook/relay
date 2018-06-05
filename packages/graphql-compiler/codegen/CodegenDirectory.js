/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const Profiler = require('../core/GraphQLCompilerProfiler');

const fs = require('fs');
const invariant = require('invariant');
const path = require('path');

import type {SourceControl} from './SourceControl';

type Changes = {
  deleted: Array<string>,
  updated: Array<string>,
  created: Array<string>,
  unchanged: Array<string>,
};

/**
 * CodegenDirectory is a helper class for scripts that generate code into one
 * output directory. The purpose is to make it easy to only write files that
 * have changed and delete files that are no longer generated.
 * It gives statistics about added/removed/updated/unchanged in the end.
 * The class also has an option to "validate" which means that no file
 * operations are performed and only the statistics are created for what would
 * have happened. If there's anything but "unchanged", someone probably forgot
 * to run the codegen script.
 *
 * Example:
 *
 *   const dir = new CodegenDirectory('/some/path/generated');
 *   // write files in case content changed (less watchman/mtime changes)
 *   dir.writeFile('OneFile.js', contents);
 *   dir.writeFile('OtherFile.js', contents);
 *
 *   // delete files that are not generated
 *   dir.deleteExtraFiles();
 *
 *   // arrays of file names to print or whatever
 *   dir.changes.created
 *   dir.changes.updated
 *   dir.changes.deleted
 *   dir.changes.unchanged
 */
class CodegenDirectory {
  changes: Changes;
  _files: Set<string>;
  _dir: string;
  onlyValidate: boolean;

  constructor(
    dir: string,
    options: {
      onlyValidate?: boolean,
    } = {},
  ) {
    this.onlyValidate = !!options.onlyValidate;
    if (fs.existsSync(dir)) {
      invariant(
        fs.statSync(dir).isDirectory(),
        'Expected `%s` to be a directory.',
        dir,
      );
    } else if (!this.onlyValidate) {
      const dirs = [dir];
      let parent = path.dirname(dir);
      while (!fs.existsSync(parent)) {
        dirs.unshift(parent);
        parent = path.dirname(parent);
      }
      dirs.forEach(d => fs.mkdirSync(d));
    }
    this._files = new Set();
    this.changes = {
      deleted: [],
      updated: [],
      created: [],
      unchanged: [],
    };
    this._dir = dir;
  }

  static combineChanges(dirs: Array<CodegenDirectory>): Changes {
    const changes = {
      deleted: [],
      updated: [],
      created: [],
      unchanged: [],
    };
    dirs.forEach(dir => {
      changes.deleted.push(...dir.changes.deleted);
      changes.updated.push(...dir.changes.updated);
      changes.created.push(...dir.changes.created);
      changes.unchanged.push(...dir.changes.unchanged);
    });
    return changes;
  }

  static hasChanges(changes: Changes): boolean {
    return (
      changes.created.length > 0 ||
      changes.updated.length > 0 ||
      changes.deleted.length > 0
    );
  }

  static printChanges(
    changes: Changes,
    options: {onlyValidate: boolean},
  ): void {
    Profiler.run('CodegenDirectory.printChanges', () => {
      const output = [];
      function printFiles(label, files) {
        if (files.length > 0) {
          output.push(label + ':');
          files.forEach(file => {
            output.push(' - ' + file);
          });
        }
      }
      if (options.onlyValidate) {
        printFiles('Missing', changes.created);
        printFiles('Out of date', changes.updated);
        printFiles('Extra', changes.deleted);
      } else {
        printFiles('Created', changes.created);
        printFiles('Updated', changes.updated);
        printFiles('Deleted', changes.deleted);
        output.push(`Unchanged: ${changes.unchanged.length} files`);
      }
      // eslint-disable-next-line no-console
      console.log(output.join('\n'));
    });
  }

  static async sourceControlAddRemove(
    sourceControl: SourceControl,
    dirs: $ReadOnlyArray<CodegenDirectory>,
  ): Promise<void> {
    const allAdded = [];
    const allRemoved = [];
    dirs.forEach(dir => {
      dir.changes.created.forEach(name => {
        allAdded.push(dir.getPath(name));
      });
      dir.changes.deleted.forEach(name => {
        allRemoved.push(dir.getPath(name));
      });
    });
    sourceControl.addRemove(allAdded, allRemoved);
  }

  printChanges(): void {
    CodegenDirectory.printChanges(this.changes, {
      onlyValidate: this.onlyValidate,
    });
  }

  read(filename: string): ?string {
    const filePath = path.join(this._dir, filename);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
    return null;
  }

  markUnchanged(filename: string) {
    this._addGenerated(filename);
    this.changes.unchanged.push(filename);
  }

  /**
   * Marks a files as updated or out of date without actually writing the file.
   * This is probably only be useful when doing validation without intention to
   * actually write to disk.
   */
  markUpdated(filename: string) {
    this._addGenerated(filename);
    this.changes.updated.push(filename);
  }

  writeFile(filename: string, content: string): void {
    Profiler.run('CodegenDirectory.writeFile', () => {
      this._addGenerated(filename);
      const filePath = path.join(this._dir, filename);
      if (fs.existsSync(filePath)) {
        const existingContent = fs.readFileSync(filePath, 'utf8');
        if (existingContent === content) {
          this.changes.unchanged.push(filename);
        } else {
          this._writeFile(filePath, content);
          this.changes.updated.push(filename);
        }
      } else {
        this._writeFile(filePath, content);
        this.changes.created.push(filename);
      }
    });
  }

  _writeFile(filePath: string, content: string): void {
    if (!this.onlyValidate) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }

  /**
   * Deletes all non-generated files, except for invisible "dot" files (ie.
   * files with names starting with ".").
   */
  deleteExtraFiles(): void {
    Profiler.run('CodegenDirectory.deleteExtraFiles', () => {
      fs.readdirSync(this._dir).forEach(actualFile => {
        if (!this._files.has(actualFile) && !/^\./.test(actualFile)) {
          if (!this.onlyValidate) {
            try {
              fs.unlinkSync(path.join(this._dir, actualFile));
            } catch (e) {
              throw new Error(
                'CodegenDirectory: Failed to delete `' +
                  actualFile +
                  '` in `' +
                  this._dir +
                  '`.',
              );
            }
          }
          this.changes.deleted.push(actualFile);
        }
      });
    });
  }

  getPath(filename: string): string {
    return path.join(this._dir, filename);
  }

  _addGenerated(filename: string): void {
    invariant(
      !this._files.has(filename),
      'CodegenDirectory: Tried to generate `%s` twice in `%s`.',
      filename,
      this._dir,
    );
    this._files.add(filename);
  }
}

module.exports = CodegenDirectory;
