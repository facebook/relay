/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const FindGraphQLTags = require('../codegen/FindGraphQLTags');
const GraphQL = require('graphql');

const fs = require('fs');
const invariant = require('invariant');
const path = require('path');

const {ASTCache, Profiler} = require('graphql-compiler');

import type {File, FileFilter} from 'graphql-compiler';
import type {DocumentNode} from 'graphql';

const parseGraphQL = Profiler.instrument(GraphQL.parse, 'GraphQL.parse');

const FIND_OPTIONS = {
  validateNames: true,
};

// Throws an error if parsing the file fails
function parseFile(baseDir: string, file: File): ?DocumentNode {
  const text = fs.readFileSync(path.join(baseDir, file.relPath), 'utf8');

  invariant(
    text.indexOf('graphql') >= 0,
    'RelayJSModuleParser: Files should be filtered before passed to the ' +
      'parser, got unfiltered file `%s`.',
    file,
  );

  const astDefinitions = [];
  FindGraphQLTags.memoizedFind(text, baseDir, file, FIND_OPTIONS).forEach(
    template => {
      const ast = parseGraphQL(new GraphQL.Source(template, file.relPath));
      invariant(
        ast.definitions.length,
        'RelayJSModuleParser: Expected GraphQL text to contain at least one ' +
          'definition (fragment, mutation, query, subscription), got `%s`.',
        template,
      );
      astDefinitions.push(...ast.definitions);
    },
  );

  return {
    kind: 'Document',
    definitions: astDefinitions,
  };
}

function getParser(baseDir: string): ASTCache {
  return new ASTCache({
    baseDir,
    parse: parseFile,
  });
}

function getFileFilter(baseDir: string): FileFilter {
  return (file: File) => {
    const text = fs.readFileSync(path.join(baseDir, file.relPath), 'utf8');
    return text.indexOf('graphql') >= 0;
  };
}

module.exports = {
  getParser,
  getFileFilter,
};
