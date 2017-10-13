/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule FindGraphQLTags
 * @flow
 * @format
 */

'use strict';

const RelayCompilerCache = require('../util/RelayCompilerCache');

const babylon = require('babylon');
const getModuleName = require('../util/getModuleName');
const graphql = require('graphql');
const path = require('path');
const util = require('util');

import type {File} from '../graphql-compiler/GraphQLCompilerPublic';

// Attempt to be as inclusive as possible of source text.
const BABYLON_OPTIONS = {
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowSuperOutsideMethod: true,
  sourceType: 'module',
  plugins: [
    // Previously "*"
    'asyncGenerators',
    'classProperties',
    'decorators',
    'doExpressions',
    'dynamicImport',
    'exportExtensions',
    'flow',
    'functionBind',
    'functionSent',
    'jsx',
    'objectRestSpread',
  ],
  strictMode: false,
};

function find(
  text: string,
  filePath: string,
): Array<{tag: string, template: string}> {
  const result = [];
  const ast = babylon.parse(text, BABYLON_OPTIONS);
  const moduleName = getModuleName(filePath);

  const visitors = {
    CallExpression: node => {
      const callee = node.callee;
      if (
        !(
          (callee.type === 'Identifier' &&
            CREATE_CONTAINER_FUNCTIONS[callee.name]) ||
          (callee.kind === 'MemberExpression' &&
            callee.object.type === 'Identifier' &&
            callee.object.value === 'Relay' &&
            callee.property.type === 'Identifier' &&
            CREATE_CONTAINER_FUNCTIONS[callee.property.name])
        )
      ) {
        traverse(node, visitors);
        return;
      }
      const fragments = node.arguments[1];
      if (fragments.type === 'ObjectExpression') {
        fragments.properties.forEach(property => {
          invariant(
            property.type === 'ObjectProperty' &&
              property.key.type === 'Identifier' &&
              property.value.type === 'TaggedTemplateExpression',
            'FindGraphQLTags: `%s` expects fragment definitions to be ' +
              '`key: graphql`.',
            node.callee.name,
          );
          const keyName = property.key.name;
          const tagName = getGraphQLTagName(property.value.tag);
          invariant(
            tagName,
            'FindGraphQLTags: `%s` expects fragment definitions to be tagged ' +
              'with `graphql`, got `%s`.',
            node.callee.name,
            getSourceTextForLocation(text, property.value.tag.loc),
          );
          const template = getGraphQLText(property.value.quasi);
          if (tagName === 'graphql') {
            validateTemplate(
              template,
              moduleName,
              keyName,
              filePath,
              getSourceLocationOffset(property.value.quasi),
            );
          }
          result.push({
            tag: tagName,
            template,
          });
        });
      } else {
        invariant(
          fragments && fragments.type === 'TaggedTemplateExpression',
          'FindGraphQLTags: `%s` expects a second argument of fragment ' +
            'definitions.',
          node.callee.name,
        );
        const tagName = getGraphQLTagName(fragments.tag);
        invariant(
          tagName,
          'FindGraphQLTags: `%s` expects fragment definitions to be tagged ' +
            'with `graphql`, got `%s`.',
          node.callee.name,
          getSourceTextForLocation(text, fragments.tag.loc),
        );
        const template = getGraphQLText(fragments.quasi);
        if (tagName === 'graphql') {
          validateTemplate(
            template,
            moduleName,
            null,
            filePath,
            getSourceLocationOffset(fragments.quasi),
          );
        }
        result.push({
          tag: tagName,
          template,
        });
      }

      // Visit remaining arguments
      for (let ii = 2; ii < node.arguments.length; ii++) {
        visit(node.arguments[ii], visitors);
      }
    },
    TaggedTemplateExpression: node => {
      const tagName = getGraphQLTagName(node.tag);
      if (tagName != null) {
        const template = getGraphQLText(node.quasi);
        if (tagName === 'graphql') {
          validateTemplate(
            template,
            moduleName,
            null,
            filePath,
            getSourceLocationOffset(node.quasi),
          );
        }
        result.push({
          tag: tagName,
          template: node.quasi.quasis[0].value.raw,
        });
      }
    },
  };
  visit(ast, visitors);
  return result;
}

const cache = new RelayCompilerCache('FindGraphQLTags', 'v1');

function memoizedFind(
  text: string,
  baseDir: string,
  file: File,
): Array<{tag: string, template: string}> {
  return cache.getOrCompute(file.hash, () => {
    const absPath = path.join(baseDir, file.relPath);
    return find(text, absPath);
  });
}

const CREATE_CONTAINER_FUNCTIONS = {
  createFragmentContainer: true,
  createPaginationContainer: true,
  createRefetchContainer: true,
};

const IDENTIFIERS = {
  graphql: true,
  // TODO: remove this deprecated usage
  Relay2QL: true,
};

const IGNORED_KEYS = {
  comments: true,
  end: true,
  leadingComments: true,
  loc: true,
  name: true,
  start: true,
  trailingComments: true,
  type: true,
};

function getGraphQLTagName(tag) {
  if (tag.type === 'Identifier' && IDENTIFIERS.hasOwnProperty(tag.name)) {
    return tag.name;
  }
  return null;
}

function getTemplateNode(quasi) {
  const quasis = quasi.quasis;
  invariant(
    quasis && quasis.length === 1,
    'FindGraphQLTags: Substitutions are not allowed in graphql tags.',
  );
  return quasis[0];
}

function getGraphQLText(quasi) {
  return getTemplateNode(quasi).value.raw;
}

function getSourceLocationOffset(quasi) {
  const loc = getTemplateNode(quasi).loc.start;
  return {
    line: loc.line,
    column: loc.column + 1, // babylon is 0-indexed, graphql expects 1-indexed
  };
}

function getSourceTextForLocation(text, loc) {
  if (loc == null) {
    return '(source unavailable)';
  }
  const lines = text.split('\n').slice(loc.start.line - 1, loc.end.line);
  lines[0] = lines[0].slice(loc.start.column);
  lines[lines.length - 1] = lines[lines.length - 1].slice(0, loc.end.column);
  return lines.join('\n');
}

function validateTemplate(template, moduleName, keyName, filePath, loc) {
  const ast = graphql.parse(new graphql.Source(template, filePath, loc));
  ast.definitions.forEach((def: any) => {
    invariant(
      def.name,
      'FindGraphQLTags: In module `%s`, a definition of kind `%s` requires a name.',
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
        'FindGraphQLTags: Operation names in graphql tags must be prefixed ' +
          'with the module name and end in "Mutation", "Query", or ' +
          '"Subscription". Got `%s` in module `%s`.',
        definitionName,
        moduleName,
      );
    } else if (def.kind === 'FragmentDefinition') {
      if (keyName) {
        invariant(
          definitionName === moduleName + '_' + keyName,
          'FindGraphQLTags: Container fragment names must be ' +
            '`<ModuleName>_<propName>`. Got `%s`, expected `%s`.',
          definitionName,
          moduleName + '_' + keyName,
        );
      } else {
        invariant(
          definitionName.startsWith(moduleName),
          'FindGraphQLTags: Fragment names in graphql tags must be prefixed ' +
            'with the module name. Got `%s` in module `%s`.',
          definitionName,
          moduleName,
        );
      }
    }
  });
}

function invariant(condition, msg, ...args) {
  if (!condition) {
    throw new Error(util.format(msg, ...args));
  }
}

function visit(node, visitors) {
  const fn = visitors[node.type];
  if (fn != null) {
    fn(node);
    return;
  }
  traverse(node, visitors);
}

function traverse(node, visitors) {
  for (const key in node) {
    if (IGNORED_KEYS[key]) {
      continue;
    }
    const prop = node[key];
    if (prop && typeof prop === 'object' && typeof prop.type === 'string') {
      visit(prop, visitors);
    } else if (Array.isArray(prop)) {
      prop.forEach(item => {
        if (item && typeof item === 'object' && typeof item.type === 'string') {
          visit(item, visitors);
        }
      });
    }
  }
}

module.exports = {
  find,
  memoizedFind,
};
