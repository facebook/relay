/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const CodegenDirectory = require('../CodegenDirectory');

import type {Filesystem} from '../CodegenDirectory';

class TestFilesystem implements Filesystem {
  __mockOperations = [];
  __mockFiles = ['foo.js', 'bar.js', 'unexpected.js', '.dotfile'];

  existsSync(path: string): boolean {
    this.__mockOperations.push(`existsSync(${path})`);
    return true;
  }
  mkdirSync(path: string): void {
    this.__mockOperations.push(`mkdirSync(${path})`);
  }
  readdirSync(path: string): Array<string> {
    this.__mockOperations.push(`readdirSync(${path})`);
    return this.__mockFiles;
  }
  readFileSync(path: string, encoding: string): string {
    this.__mockOperations.push(`readFileSync(${path})`);
    return `mock-content-${path}`;
  }
  statSync(path: string): {isDirectory(): boolean, ...} {
    this.__mockOperations.push(`statSync(${path})`);
    return {
      isDirectory() {
        // assume anything not ending with .js is a directory
        return !path.endsWith('.js');
      },
    };
  }
  unlinkSync(path: string): void {
    this.__mockOperations.push(`unlinkSync(${path})`);
  }
  writeFileSync(filename: string, data: string, options: string): void {
    this.__mockOperations.push(`writeFileSync(${filename})`);
  }
}

describe('deleteExtraFiles', () => {
  test('onlyValidate: false', () => {
    const filesystem = new TestFilesystem();
    const codegenDir = new CodegenDirectory('/generated', {
      filesystem,
      onlyValidate: false,
    });
    codegenDir.writeFile('foo.js', 'mock-content-/generated/foo.js');
    codegenDir.writeFile('bar.js', 'mock-content-/generated/bar.js-changed');
    codegenDir.deleteExtraFiles();
    expect(filesystem.__mockOperations).toEqual([
      'existsSync(/generated)',
      'statSync(/generated)',
      'existsSync(/generated)',
      'existsSync(/generated/foo.js)',
      'readFileSync(/generated/foo.js)',
      'existsSync(/generated/bar.js)',
      'readFileSync(/generated/bar.js)',
      'writeFileSync(/generated/bar.js)',
      'readdirSync(/generated)',
      'unlinkSync(/generated/unexpected.js)',
    ]);
    expect(codegenDir.changes).toEqual({
      created: [],
      deleted: ['unexpected.js'],
      unchanged: ['foo.js'],
      updated: ['bar.js'],
    });
  });

  test('onlyValidate: true', () => {
    const filesystem = new TestFilesystem();
    const codegenDir = new CodegenDirectory('/generated', {
      filesystem,
      onlyValidate: true,
    });
    codegenDir.writeFile('foo.js', 'mock-content-/generated/foo.js');
    codegenDir.writeFile('bar.js', 'mock-content-/generated/bar.js-changed');
    codegenDir.deleteExtraFiles();
    expect(filesystem.__mockOperations).toEqual([
      'existsSync(/generated)',
      'statSync(/generated)',
      'existsSync(/generated/foo.js)',
      'readFileSync(/generated/foo.js)',
      'existsSync(/generated/bar.js)',
      'readFileSync(/generated/bar.js)',
      'readdirSync(/generated)',
    ]);
    expect(codegenDir.changes).toEqual({
      created: [],
      deleted: ['unexpected.js'],
      unchanged: ['foo.js'],
      updated: ['bar.js'],
    });
  });

  test('allows whitelisting files to not delete through function provided to deleteExtraFiles', () => {
    const filesystem = new TestFilesystem();
    const codegenDir = new CodegenDirectory('/generated', {
      filesystem,
      onlyValidate: false,
    });
    codegenDir.writeFile('foo.js', 'mock-content-/generated/foo.js');
    codegenDir.writeFile('bar.js', 'mock-content-/generated/bar.js-changed');
    codegenDir.deleteExtraFiles(filePath => filePath.endsWith('unexpected.js'));
    expect(filesystem.__mockOperations).toEqual([
      'existsSync(/generated)',
      'statSync(/generated)',
      'existsSync(/generated)',
      'existsSync(/generated/foo.js)',
      'readFileSync(/generated/foo.js)',
      'existsSync(/generated/bar.js)',
      'readFileSync(/generated/bar.js)',
      'writeFileSync(/generated/bar.js)',
      'readdirSync(/generated)',
    ]);
    expect(codegenDir.changes).toEqual({
      created: [],
      deleted: [],
      unchanged: ['foo.js'],
      updated: ['bar.js'],
    });
  });
});
