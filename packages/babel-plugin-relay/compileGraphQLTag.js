/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const createClassicNode = require('./createClassicNode');
const createCompatNode = require('./createCompatNode');
const createModernNode = require('./createModernNode');
const getFragmentNameParts = require('./getFragmentNameParts');

import type {BabelState} from './BabelPluginRelay';
import typeof BabelTypes from 'babel-types';
import type {DocumentNode} from 'graphql';

/**
 * Given a graphql`` tagged template literal, replace it with the appropriate
 * runtime artifact.
 */
function compileGraphQLTag(
  t: BabelTypes,
  path: Object,
  state: BabelState,
  ast: DocumentNode,
): void {
  const mainDefinition = ast.definitions[0];

  if (mainDefinition.kind === 'FragmentDefinition') {
    const objPropName = getAssignedObjectPropertyName(t, path);
    if (objPropName) {
      if (ast.definitions.length !== 1) {
        throw new Error(
          'BabelPluginRelay: Expected exactly one fragment in the ' +
            `graphql tag referenced by the property ${objPropName}.`,
        );
      }
      return replaceMemoized(
        t,
        path,
        createAST(t, state, path, mainDefinition),
      );
    }

    const nodeMap = {};
    for (const definition of ast.definitions) {
      if (definition.kind !== 'FragmentDefinition') {
        throw new Error(
          'BabelPluginRelay: Expected only fragments within this ' +
            'graphql tag.',
        );
      }

      const [, propName] = getFragmentNameParts(definition.name.value);
      nodeMap[propName] = createAST(t, state, path, definition);
    }
    return replaceMemoized(t, path, createObject(t, nodeMap));
  }

  if (mainDefinition.kind === 'OperationDefinition') {
    if (ast.definitions.length !== 1) {
      throw new Error(
        'BabelPluginRelay: Expected exactly one operation ' +
          '(query, mutation, or subscription) per graphql tag.',
      );
    }
    return replaceMemoized(t, path, createAST(t, state, path, mainDefinition));
  }

  throw new Error(
    'BabelPluginRelay: Expected a fragment, mutation, query, or ' +
      'subscription, got `' +
      mainDefinition.kind +
      '`.',
  );
}

function createAST(t, state, path, graphqlDefinition) {
  const isCompatMode = Boolean(state.opts && state.opts.compat);
  const isHasteMode = Boolean(state.opts && state.opts.haste);
  const isDevVariable = state.opts && state.opts.isDevVariable;
  const buildCommand =
    (state.opts && state.opts.buildCommand) || 'relay-compiler';

  // Fallback is 'true'
  const isDevelopment =
    (process.env.BABEL_ENV || process.env.NODE_ENV) !== 'production';

  const modernNode = createModernNode(t, graphqlDefinition, {
    buildCommand,
    isDevelopment,
    isHasteMode,
    isDevVariable,
  });
  if (isCompatMode) {
    return createCompatNode(
      t,
      modernNode,
      createClassicNode(t, path, graphqlDefinition, state),
    );
  }
  return modernNode;
}

function replaceMemoized(t, path, ast) {
  let topScope = path.scope;
  while (topScope.parent) {
    topScope = topScope.parent;
  }

  if (path.scope === topScope) {
    path.replaceWith(ast);
  } else {
    const id = topScope.generateDeclaredUidIdentifier('graphql');
    path.replaceWith(
      t.logicalExpression('||', id, t.assignmentExpression('=', id, ast)),
    );
  }
}

function createObject(t, obj: any) {
  return t.objectExpression(
    Object.keys(obj).map(key => t.objectProperty(t.identifier(key), obj[key])),
  );
}

function getAssignedObjectPropertyName(t, path) {
  var property = path;
  while (property) {
    if (t.isObjectProperty(property) && property.node.key.name) {
      return property.node.key.name;
    }
    property = property.parentPath;
  }
}

module.exports = compileGraphQLTag;
