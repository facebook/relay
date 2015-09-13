/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var transformGraphQL = require('../src/transformGraphQL');

function getFilePath(path) {
  return path && fs.existsSync(path) ? path : null;
}

var file = getFilePath(argv.file);
var schema = getFilePath(argv.schema);

if (!file || !schema) {
  console.warn(
    'Usage: %s: --file <file> --schema <schema>',
    process.argv[1]
  );
  process.exit(1);
}

process.stdout.write(
  transformGraphQL(schema, fs.readFileSync(file, 'utf8'), file)
);
