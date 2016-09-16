/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @fullSyntaxTransform
 */

'use strict';

jest.disableAutomock();

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');

const HASH_PATH = path.join(ROOT_DIR, 'lib', 'HASH');
const SRC_DIR = path.join(ROOT_DIR, 'src');

function filesInDir(dir) {
  return fs.readdirSync(dir).map((name) => path.join(dir, name));
}

/**
 * Checks that `lib/` is up-to-date with `src/`.
 */
describe('babel-relay-plugin', () => {
  it('has been built with the latest source', () => {
    const srcFiles = [].concat(
      filesInDir(SRC_DIR),
      filesInDir(path.join(SRC_DIR, 'tools'))
    );

    const sources = srcFiles
      .filter((path) => path.endsWith('.js'))
      .map((path) => fs.readFileSync(path, 'utf8'))
      .sort();

    const hash = crypto.createHash('sha1');
    sources.forEach((source) => {
      hash.update(source);
    });

    const expectedHash = fs.readFileSync(HASH_PATH, 'utf8');
    const actualHash = hash.digest('base64');
    expect(expectedHash).toEqual(actualHash);
  });
});
