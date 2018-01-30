/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule DotGraphQLParser
 * @flow
 * @format
 */

'use strict';

const ASTCache = require('./ASTCache');

const fs = require('fs');
const path = require('path');

const {parse, Source} = require('graphql');

import type {File} from '../codegen/CodegenTypes';
import type {DocumentNode} from 'graphql';

function parseFile(baseDir: string, file: File): ?DocumentNode {
  const text = fs.readFileSync(path.join(baseDir, file.relPath), 'utf8');
  return parse(new Source(text, file.relPath), {
    experimentalFragmentVariables: true,
  });
}

exports.getParser = function getParser(baseDir: string): ASTCache {
  return new ASTCache({baseDir, parse: parseFile});
};
