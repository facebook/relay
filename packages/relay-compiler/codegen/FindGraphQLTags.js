/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule FindGraphQLTags
 * @flow
 * @format
 */

'use strict';

const babylon = require('babylon');
const crypto = require('crypto');
const graphql = require('graphql');
const path = require('path');
const util = require('util');

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
  const moduleName = extractModuleName(text, filePath);

  const visitors = {
    CallExpression: node => {
      const callee = node.callee;
      if (
        !((callee.type === 'Identifier' &&
          CREATE_CONTAINER_FUNCTIONS[callee.name]) ||
          (callee.kind === 'MemberExpression' &&
            callee.object.type === 'Identifier' &&
            callee.object.value === 'Relay' &&
            callee.property.type === 'Identifier' &&
            CREATE_CONTAINER_FUNCTIONS[callee.property.name]))
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
          if (tagName === 'graphql' || tagName === 'graphql.experimental') {
            validateTemplate(template, moduleName, keyName);
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
        if (tagName === 'graphql' || tagName === 'graphql.experimental') {
          validateTemplate(template, moduleName);
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
        if (tagName === 'graphql' || tagName === 'graphql.experimental') {
          validateTemplate(template, moduleName);
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

const cache = {};
function memoizedFind(
  text: string,
  filePath: string,
): Array<{tag: string, template: string}> {
  const hash = crypto
    .createHash('md5')
    .update(filePath)
    .update(text)
    .digest('hex');
  let result = cache[hash];
  if (!result) {
    result = find(text, filePath);
    cache[hash] = result;
  }
  return result;
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
  } else if (
    tag.type === 'MemberExpression' &&
    tag.object.type === 'Identifier' &&
    tag.object.name === 'graphql' &&
    tag.property.type === 'Identifier' &&
    tag.property.name === 'experimental'
  ) {
    return 'graphql.experimental';
  }
  return null;
}

function getGraphQLText(quasi) {
  const quasis = quasi.quasis;
  invariant(
    quasis && quasis.length === 1,
    'FindGraphQLTags: Substitutions are not allowed in graphql tags.',
  );
  return quasis[0].value.raw;
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

function validateTemplate(template, moduleName, keyName) {
  const ast = graphql.parse(template);
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

function extractModuleName(text, filePath) {
  const rawModuleName =
    extractProvidesModuleName(text) || extractFileModuleName(filePath);
  return rawModuleName.replace(/\.react$/, '').replace(/[^a-zA-Z0-9_]/g, '_');
}

function extractFileModuleName(filePath) {
  const filename = path.basename(filePath, path.extname(filePath));
  if (filename !== 'index') {
    return filename;
  }
  return path.basename(path.dirname(filePath));
}

function extractProvidesModuleName(text) {
  const propertyRegex = /@(\S+) *(\S*)/g;
  let captures;
  while ((captures = propertyRegex.exec(text))) {
    const prop = captures[1];
    const value = captures[2];
    if (prop === 'providesModule') {
      return value;
    }
  }
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
