/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const Profiler = require('../../core/GraphQLCompilerProfiler');

const babylon = require('@babel/parser');
const util = require('util');

import type {GraphQLTag} from '../RelayLanguagePluginInterface';

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
    ['decorators', {decoratorsBeforeExport: true}],
    'doExpressions',
    'dynamicImport',
    'exportExtensions',
    'flow',
    'functionBind',
    'functionSent',
    'jsx',
    'nullishCoalescingOperator',
    'objectRestSpread',
    'optionalChaining',
    'optionalCatchBinding',
  ],
  strictMode: false,
};

function find(text: string): $ReadOnlyArray<GraphQLTag> {
  const result: Array<GraphQLTag> = [];
  const ast = babylon.parse(text, BABYLON_OPTIONS);

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
          invariant(
            isGraphQLModernOrDeprecatedTag(property.value.tag),
            'FindGraphQLTags: `%s` expects fragment definitions to be tagged ' +
              'with `graphql`, got `%s`.',
            node.callee.name,
            getSourceTextForLocation(text, property.value.tag.loc),
          );
          if (isGraphQLTag(property.value.tag)) {
            result.push({
              keyName: property.key.name,
              template: getGraphQLText(property.value.quasi),
              sourceLocationOffset: getSourceLocationOffset(
                property.value.quasi,
              ),
            });
          }
        });
      } else {
        invariant(
          fragments && fragments.type === 'TaggedTemplateExpression',
          'FindGraphQLTags: `%s` expects a second argument of fragment ' +
            'definitions.',
          node.callee.name,
        );
        invariant(
          isGraphQLModernOrDeprecatedTag(fragments.tag),
          'FindGraphQLTags: `%s` expects fragment definitions to be tagged ' +
            'with `graphql`, got `%s`.',
          node.callee.name,
          getSourceTextForLocation(text, fragments.tag.loc),
        );
        result.push({
          keyName: null,
          template: getGraphQLText(fragments.quasi),
          sourceLocationOffset: getSourceLocationOffset(fragments.quasi),
        });
      }

      // Visit remaining arguments
      for (let ii = 2; ii < node.arguments.length; ii++) {
        visit(node.arguments[ii], visitors);
      }
    },
    TaggedTemplateExpression: node => {
      if (isGraphQLTag(node.tag)) {
        result.push({
          keyName: null,
          template: node.quasi.quasis[0].value.raw,
          sourceLocationOffset: getSourceLocationOffset(node.quasi),
        });
      }
    },
  };
  visit(ast, visitors);
  return result;
}

const CREATE_CONTAINER_FUNCTIONS = Object.create(null, {
  createFragmentContainer: {value: true},
  createPaginationContainer: {value: true},
  createRefetchContainer: {value: true},
});

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

function isGraphQLTag(tag): boolean {
  return tag.type === 'Identifier' && tag.name === 'graphql';
}

function isGraphQLModernOrDeprecatedTag(tag): boolean {
  return (
    tag.type === 'Identifier' &&
    (tag.name === 'graphql' || tag.name === 'graphql_DEPRECATED')
  );
}

function getTemplateNode(quasi) {
  const quasis = quasi.quasis;
  invariant(
    quasis && quasis.length === 1,
    'FindGraphQLTags: Substitutions are not allowed in graphql tags.',
  );
  return quasis[0];
}

function getGraphQLText(quasi): string {
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
  find: (Profiler.instrument(find, 'FindGraphQLTags.find'): (
    text: string,
  ) => $ReadOnlyArray<GraphQLTag>),
};
