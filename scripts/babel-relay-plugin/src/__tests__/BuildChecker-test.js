/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @fullSyntaxTransform
 */

'use strict';

const babel = require('babel');
const fs = require('fs');
const path = require('path');
const util = require('util');

const ROOT_DIR = path.resolve(__dirname, '..', '..');

const LIB_DIR = path.join(ROOT_DIR, 'lib');
const SRC_DIR = path.join(ROOT_DIR, 'src');

/**
 * Checks that `lib/` is up-to-date with `src/`.
 */
describe('babel-relay-plugin', () => {
  beforeEach(() => {
    jest.addMatchers({
      toExist() {
        const libPath = this.actual;
        return fs.existsSync(libPath);
      },
      toTransformInto(libPath) {
        const srcPath = this.actual;
        const libCode = fs.readFileSync(libPath);
        const srcCode = fs.readFileSync(srcPath);
        this.message = () => util.format(
          'Expected `%s` to transform into `%s`. Try running: npm run build',
          path.relative(ROOT_DIR, libPath),
          path.relative(ROOT_DIR, srcPath)
        );
        const transformed = babel.transform(srcCode);
        // Cannot use a `===` because of generated comment, newlines, etc.
        return libCode.indexOf(transformed.code) >= 0;
      }
    });
  });

  it('has been built properly', () => {
    fs.readdirSync(SRC_DIR).forEach(filename => {
      if (!filename.endsWith('.js')) {
        return;
      }
      const libPath = path.join(LIB_DIR, filename);
      const srcPath = path.join(SRC_DIR, filename);
      expect(libPath).toExist();
      expect(srcPath).toTransformInto(libPath);
    });
  });
});
