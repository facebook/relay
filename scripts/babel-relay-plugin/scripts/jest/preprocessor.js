/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const babel = require('babel-core');
const fbjsPreset = require('babel-preset-fbjs');
const jestPreset = require('babel-preset-jest');
const path = require('path');

const NODE_MODULES = path.sep + 'node_modules' + path.sep;

module.exports = {
  process: function(src, filename) {
    if (!filename.includes(NODE_MODULES) && babel.util.canCompile(filename)) {
      const options = {
        presets: [
          fbjsPreset,
          jestPreset,
        ],
        filename: filename,
        retainLines: true,
      };
      return babel.transform(src, options).code;
    }
    return src;
  },
};
