/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const RelayCompilerCache = require('../util/RelayCompilerCache');

const getModuleName = require('../util/getModuleName');
const graphql = require('graphql');
const path = require('path');
const util = require('util');

import type {
  GraphQLTag,
  GraphQLTagFinder,
} from '../language/RelayLanguagePluginInterface';
import type {File} from 'graphql-compiler';

export type GraphQLTagFinderOptions = {|
  validateNames: boolean,
|};

const cache = new RelayCompilerCache('RelayFindGraphQLTags', 'v1');

function memoizedFind(
  tagFinder: GraphQLTagFinder,
  text: string,
  baseDir: string,
  file: File,
  options: GraphQLTagFinderOptions,
): Array<string> {
  invariant(
    file.exists,
    'RelayFindGraphQLTags: Called with non-existent file `%s`',
    file.relPath,
  );
  return cache.getOrCompute(
    file.hash + (options.validateNames ? '1' : '0'),
    find.bind(null, tagFinder, text, path.join(baseDir, file.relPath), options),
  );
}

function find(
  tagFinder: GraphQLTagFinder,
  text: string,
  absPath: string,
  {validateNames}: GraphQLTagFinderOptions,
): Array<string> {
  const tags = tagFinder(text, absPath);
  if (validateNames) {
    const moduleName = getModuleName(absPath);
    tags.forEach(tag => validateTemplate(tag, moduleName, absPath));
  }
  return tags.map(tag => tag.template);
}

function validateTemplate(
  {template, keyName, sourceLocationOffset}: GraphQLTag,
  moduleName: string,
  filePath: string,
) {
  const ast = graphql.parse(
    new graphql.Source(template, filePath, sourceLocationOffset),
  );
  ast.definitions.forEach((def: any) => {
    invariant(
      def.name,
      'RelayFindGraphQLTags: In module `%s`, a definition of kind `%s` requires a name.',
      moduleName,
      def.kind,
    );
    const definitionName = def.name.value;
    if (def.kind === 'OperationDefinition') {
      const operationNameParts = definitionName.match(
        /^(.*)(Mutation|Query|Subscription)$/,
      );
      invariant(
        operationNameParts && definitionName.startsWith(moduleName),
        'RelayFindGraphQLTags: Operation names in graphql tags must be prefixed ' +
          'with the module name and end in "Mutation", "Query", or ' +
          '"Subscription". Got `%s` in module `%s`.',
        definitionName,
        moduleName,
      );
    } else if (def.kind === 'FragmentDefinition') {
      if (keyName) {
        invariant(
          definitionName === moduleName + '_' + keyName,
          'RelayFindGraphQLTags: Container fragment names must be ' +
            '`<ModuleName>_<propName>`. Got `%s`, expected `%s`.',
          definitionName,
          moduleName + '_' + keyName,
        );
      } else {
        invariant(
          definitionName.startsWith(moduleName),
          'RelayFindGraphQLTags: Fragment names in graphql tags must be prefixed ' +
            'with the module name. Got `%s` in module `%s`.',
          definitionName,
          moduleName,
        );
      }
    }
  });
}

// TODO: Not sure why this is defined here rather than imported, is it so that it doesn’t get stripped in prod?
function invariant(condition, msg, ...args) {
  if (!condition) {
    throw new Error(util.format(msg, ...args));
  }
}

module.exports = {
  find, // Exported for testing only.
  memoizedFind,
};
