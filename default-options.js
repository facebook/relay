/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var babelPluginModules = require('./rewrite-modules');
var babelPluginAutoImporter = require('fbjs-scripts/babel-6/auto-importer');
var inlineRequires = require('./inline-requires');

var plugins = [
    babelPluginAutoImporter,
    babelPluginModules,
  "transform-flow-strip-types", "syntax-object-rest-spread", "transform-object-rest-spread", "babel-plugin-transform-es2015-destructuring"
];

if (process.env.NODE_ENV === 'test') {
  plugins.push(inlineRequires);
}

module.exports = {
  plugins: plugins,
  presets: ["es2015", "react", "stage-0"]
};
