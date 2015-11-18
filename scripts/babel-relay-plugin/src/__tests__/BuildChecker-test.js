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

const babel = require('babel-core');
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
      toTransformInto(libFile) {
        const srcFile = this.actual;
        this.message = () => util.format(
          'Expected `%s` to transform into `%s`. Try running: npm run build',
          path.relative(ROOT_DIR, srcFile),
          path.relative(ROOT_DIR, libFile)
        );
        if (!fs.existsSync(libFile)) {
          return false;
        }
        const libCode = fs.readFileSync(libFile);
        const srcCode = fs.readFileSync(srcFile);
        let babelOptions = {presets: ["es2015", "stage-0"], plugins: ["transform-flow-strip-types", "syntax-object-rest-spread", "transform-object-rest-spread", "babel-plugin-transform-es2015-destructuring"]};
        const transformed = babel.transform(srcCode, babelOptions);
        // Cannot use a `===` because of generated comment, newlines, etc.
        return libCode.indexOf(transformed.code) >= 0;
      }
    });
  });

  it('has been built properly', () => {
    ['', 'tools'].forEach(dirname => {
      const libPath = path.join(LIB_DIR, dirname);
      const srcPath = path.join(SRC_DIR, dirname);

      fs.readdirSync(srcPath).forEach(filename => {
        if (!filename.endsWith('.js')) {
          return;
        }
        const libFile = path.join(libPath, filename);
        const srcFile = path.join(srcPath, filename);
        expect(srcFile).toTransformInto(libFile);
      });
    });
  });
});
