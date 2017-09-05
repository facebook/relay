/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GraphQLTextParser
 * @flow
 * @format
 */

'use strict';

const FileParser = require('./FileParser');
const {Source, parse} = require('graphql');

const fs = require('fs');
const invariant = require('invariant');
const path = require('path');

import type {File} from '../codegen/CodegenTypes';
import type {DocumentNode} from 'graphql';

// Throws an error if parsing the file fails
function parseFile(
  baseDir: string,
  file: File,
  openTag: string,
  closeTag: string,
): ?DocumentNode {
  const text = fs.readFileSync(path.join(baseDir, file.relPath), 'utf8');
  const regex = new RegExp(openTag + '([\\s\\S]*?)' + closeTag, 'g');
  let graphqlText;
  const astDefinitions = [];
  while ((graphqlText = regex.exec(text)) !== null) {
    const ast = parse(new Source(graphqlText[1], file.relPath));
    invariant(
      ast.definitions.length,
      'GraphQLTextParser: Expected GraphQL text to contain at least one ' +
        'definition (fragment, mutation, query, subscription), got `%s`.',
      graphqlText[1],
    );
    astDefinitions.push(...ast.definitions);
  }
  return {
    kind: 'Document',
    definitions: astDefinitions,
  };
}

function getParser(baseDir: string, openTag: string, closeTag: string): FileParser {
  return new FileParser({
    baseDir,
    parse: (baseDir: string, file: File) => (
      parseFile(baseDir, file, openTag, closeTag)
    ),
  });
}

module.exports = {
  getParser,
};
