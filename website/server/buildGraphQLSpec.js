/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

const exec = require('child_process').execFileSync;
const fs = require('fs-extra');
const glob = require('glob');

module.exports = function(targetDir) {
  fs.copySync('node_modules/spec-md/css', targetDir + '/relay/graphql');
  glob.sync('graphql/*.md').forEach(function(file) {
    const html = exec('./node_modules/.bin/spec-md', [file]);
    const outFilename = (
      targetDir + '/relay/graphql/' +
      path.basename(file, '.md').toLowerCase() +
      '.htm'
    );
    fs.writeFileSync(outFilename, html.toString());
  });
};
