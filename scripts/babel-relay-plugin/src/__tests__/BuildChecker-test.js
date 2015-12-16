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

function normalizeCode(code) {
  // The definition of _get is slightly different in the FB internal transform.
  return code
    .replace(/^var _get = .*;$/m, 'var _get = ...;')
    .replace(/^\/\/ @generated$/m, '')
    .trim();
}

/**
 * Checks that `lib/` is up-to-date with `src/`.
 */
describe('babel-relay-plugin', () => {
  beforeEach(() => {
    jasmine.addMatchers({
      toTransformInto() {
        return {
          compare(srcFile, libFile) {
            if (!fs.existsSync(libFile)) {
              return false;
            }
            const libCode = fs.readFileSync(libFile, 'utf8');
            const srcCode = fs.readFileSync(srcFile, 'utf8');
            const transformed = babel.transform(srcCode).code;

            return {
              pass: normalizeCode(libCode) === normalizeCode(transformed),
              message: util.format(
                'Expected `%s` to transform into `%s`. ' +
                'Try running: npm run build',
                path.relative(ROOT_DIR, srcFile),
                path.relative(ROOT_DIR, libFile)
              ),
            };
          },
        };
      },
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
