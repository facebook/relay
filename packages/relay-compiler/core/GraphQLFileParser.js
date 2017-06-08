/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GraphQLFileParser
 * @flow
 * @format
 */

'use strict';

const FileParser = require('FileParser');
const GraphQL = require('graphql');

const fs = require('fs');
const path = require('path');

import type {DocumentNode} from 'graphql';

function parseFile(file: string): ?DocumentNode {
  const text = fs.readFileSync(file, 'utf8');
  const moduleName = path.basename(file, '.graphql');

  let ast;
  try {
    ast = GraphQL.parse(new GraphQL.Source(text, moduleName));
  } catch (e) {
    // Swallow any errors with files that have invalid syntax
    // TODO: we should not swallow these errors
    return null;
  }

  return ast;
}

function getParser(baseDir: string): FileParser {
  return new FileParser({
    baseDir,
    parse: parseFile,
  });
}

module.exports = {
  getParser,
};
