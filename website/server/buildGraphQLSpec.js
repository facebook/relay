/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var exec = require('child_process').execFileSync;
var fs = require('fs-extra');
var glob = require('glob');

module.exports = function(targetDir) {
  fs.copySync('node_modules/spec-md/css', targetDir + '/relay/graphql');
  glob.sync('graphql/*.md').forEach(function(file) {
    var html = exec('./node_modules/.bin/spec-md', [file]);
    var outFilename = (
      targetDir + '/relay/graphql/' +
      path.basename(file, '.md').toLowerCase() +
      '.htm'
    );
    fs.writeFileSync(outFilename, html.toString());
  });
}
