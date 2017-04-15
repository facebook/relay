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

const fs = require('fs');
const readFixtures = require('./readFixtures');

function write(name, data) {
  fs.writeFileSync(outputDir + '/' + name, data, 'utf8');
}

const outputDir = __dirname + '/../../__tests__/fixtures-classic';
fs.mkdirSync(outputDir);

const fixtures = readFixtures(__dirname + '/../__fixtures__');
for (const name in fixtures) {
  const baseName = name.match(/^(\w+)\.fixture$/)[1];
  const {
    input,
    output,
    error,
  } = fixtures[name];
  write(`${baseName}.input.txt`, input);
  if (error) {
    write(`${baseName}.golden.txt`, `ERROR:\n${error}`);
  } else {
    write(`${baseName}.golden.txt`, output);
  }
}
