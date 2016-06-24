// @generated
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

var fs = require('fs');
var path = require('path');

function readFixtures(fixturePath) {
  var fileNames = fs.readdirSync(fixturePath);
  var fixtures = {};
  fileNames.forEach(function (filename) {
    var match = filename.match(/^\w+\.fixture$/);
    if (match === null) {
      return;
    }
    var name = match[0];
    var data = fs.readFileSync(path.join(fixturePath, filename), { encoding: 'utf8' });
    var parts;

    // Matches a file of form:
    //   Schema:
    //   <name>
    //   Input:
    //   <code>
    //   Output:
    //   <code>
    parts = data.match(new RegExp('(?:^|\\n)' + ['Schema:\\n([\\s\\S]*)', 'Input:\\n([\\s\\S]*)', 'Output:\\n([\\s\\S]*)'].join('\\n') + '$'));
    if (parts) {
      fixtures[name] = {
        schema: parts[1].trim(),
        input: parts[2].trim(),
        output: parts[3].trim()
      };
      return;
    }

    // Matches a file of form:
    //   Schema:
    //   <name>
    //   Input:
    //   <code>
    //   Error:
    //   <code>
    parts = data.match(new RegExp('(?:^|\\n)' + ['Schema:\\n([\\s\\S]*)', 'Input:\\n([\\s\\S]*)', 'Error:\\n([\\s\\S]*)'].join('\\n') + '$'));
    if (parts) {
      fixtures[name] = {
        schema: parts[1].trim(),
        input: parts[2].trim(),
        error: parts[3].trim()
      };
      return;
    }

    throw new Error('Invalid fixture file: ' + filename);
  });

  return fixtures;
}

module.exports = readFixtures;