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

var babel = require('babel-core');
var fs = require('fs');
var path = require('path');
var util = require('util');

var ROOT_DIR = path.resolve(__dirname, '..', '..');

var LIB_DIR = path.join(ROOT_DIR, 'lib');
var SRC_DIR = path.join(ROOT_DIR, 'src');

/**
 * Checks that `lib/` is up-to-date with `src/`.
 */
describe('babel-relay-plugin', function () {
  beforeEach(function () {
    jest.addMatchers({
      toTransformInto: function toTransformInto(libFile) {
        var srcFile = this.actual;
        this.message = function () {
          return util.format('Expected `%s` to transform into `%s`. Try running: npm run build', path.relative(ROOT_DIR, srcFile), path.relative(ROOT_DIR, libFile));
        };
        if (!fs.existsSync(libFile)) {
          return false;
        }
        var libCode = fs.readFileSync(libFile);
        var srcCode = fs.readFileSync(srcFile);
        var babelOptions = { presets: ["es2015", "stage-0"], plugins: ["transform-flow-strip-types", "syntax-object-rest-spread", "transform-object-rest-spread", "babel-plugin-transform-es2015-destructuring"] };
        var transformed = babel.transform(srcCode, babelOptions);
        // Cannot use a `===` because of generated comment, newlines, etc.
        return libCode.indexOf(transformed.code) >= 0;
      }
    });
  });

  it('has been built properly', function () {
    ['', 'tools'].forEach(function (dirname) {
      var libPath = path.join(LIB_DIR, dirname);
      var srcPath = path.join(SRC_DIR, dirname);

      fs.readdirSync(srcPath).forEach(function (filename) {
        if (!filename.endsWith('.js')) {
          return;
        }
        var libFile = path.join(libPath, filename);
        var srcFile = path.join(srcPath, filename);
        expect(srcFile).toTransformInto(libFile);
      });
    });
  });
});