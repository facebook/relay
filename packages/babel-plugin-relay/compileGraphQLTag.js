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

const createClassicNode = require('./createClassicNode');
const createCompatNode = require('./createCompatNode');
const createModernNode = require('./createModernNode');
const getFragmentNameParts = require('./getFragmentNameParts');

import type {BabelState} from './BabelPluginRelay';
import type {DocumentNode} from 'graphql';

/**
 * Given a graphql`` tagged template literal, replace it with the appropriate
 * runtime artifact.
 */
function compileGraphQLTag(
  t: $FlowFixMe,
  path: Object,
  state: BabelState,
  ast: DocumentNode,
): void {
  if (ast.definitions.length !== 1) {
    throw new Error(
      'BabelPluginRelay: Expected exactly one definition per graphql tag.',
    );
  }
  const definition = ast.definitions[0];
  switch (definition.kind) {
    case 'FragmentDefinition':
      const objPropName = getAssignedObjectPropertyName(t, path);
      if (objPropName) {
        return replaceMemoized(t, path, createAST(t, state, path, definition));
      }
      const nodeMap = {};
      const [, propName] = getFragmentNameParts(definition.name.value);
      nodeMap[propName] = createAST(t, state, path, definition);
      return replaceMemoized(t, path, createObject(t, nodeMap));
    case 'OperationDefinition':
      return replaceMemoized(t, path, createAST(t, state, path, definition));
  }
  throw new Error(
    'BabelPluginRelay: Expected a fragment, mutation, query, or ' +
      'subscription, got `' +
      definition.kind +
      '`.',
  );
}

function createAST(t, state, path, graphqlDefinition) {
  const isCompatMode = Boolean(state.opts && state.opts.compat);
  const isHasteMode = Boolean(state.opts && state.opts.haste);
  const isDevVariable = state.opts && state.opts.isDevVariable;
  const artifactDirectory = state.opts && state.opts.artifactDirectory;
  const buildCommand =
    (state.opts && state.opts.buildCommand) || 'relay-compiler';

  // Fallback is 'true'
  const isDevelopment =
    (process.env.BABEL_ENV || process.env.NODE_ENV) !== 'production';

  const modernNode = createModernNode(t, graphqlDefinition, state, {
    artifactDirectory,
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
