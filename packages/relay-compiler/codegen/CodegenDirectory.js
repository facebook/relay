/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule CodegenDirectory
 * @flow
 */

'use strict';

const fs = require('fs');
const invariant = require('invariant');
const path = require('path');

type Stats = {
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
  changes: Stats;
  _files: Set<string>;
  _dir: string;
  onlyValidate: boolean;

  constructor(dir: string, options: {
    onlyValidate?: boolean,
  } = {}) {
    this.onlyValidate = !!options.onlyValidate;
    if (fs.existsSync(dir)) {
      invariant(
        fs.statSync(dir).isDirectory(),
        'Expected `%s` to be a directory.',
        dir
      );
    } else if (!this.onlyValidate) {
      fs.mkdirSync(dir);
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
  }

  _writeFile(filePath: string, content: string): void {
    if (!this.onlyValidate) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }

  deleteExtraFiles(): void {
    fs.readdirSync(this._dir).forEach(actualFile => {
      if (!this._files.has(actualFile)) {
        if (!this.onlyValidate) {
          fs.unlinkSync(path.join(this._dir, actualFile));
        }
        this.changes.deleted.push(actualFile);
      }
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
