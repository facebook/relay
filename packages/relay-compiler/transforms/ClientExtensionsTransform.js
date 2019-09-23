/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const GraphQLIRTransformer = require('../core/GraphQLIRTransformer');

const {
  getRawType,
  isClientDefinedField,
} = require('../core/GraphQLSchemaUtils');
const {
  createCompilerError,
  createUserError,
} = require('../core/RelayCompilerError');

import type GraphQLCompilerContext from '../core/GraphQLCompilerContext';
import type {Definition, Node, Selection} from '../core/GraphQLIR';
import type {GraphQLType} from 'graphql';

type State = {|
  clientFields: Map<string, Selection>,
  parentType: GraphQLType | null,
|};

let cachesByNode = new Map();
function clientExtensionTransform(
  context: GraphQLCompilerContext,
): GraphQLCompilerContext {
  cachesByNode = new Map();
  return GraphQLIRTransformer.transform<State>(context, {
    Fragment: traverseDefinition,
    Root: traverseDefinition,
    SplitOperation: traverseDefinition,
  });
}

function traverseDefinition<T: Definition>(node: T): T {
  const compilerContext = this.getContext();
  const {serverSchema, clientSchema} = compilerContext;
  let rootType;
  switch (node.kind) {
    case 'Root':
      switch (node.operation) {
        case 'query':
          rootType = serverSchema.getQueryType();
          break;
        case 'mutation':
          rootType = serverSchema.getMutationType();
          break;
        case 'subscription':
          rootType = serverSchema.getSubscriptionType();
          break;
        default:
          (node.operation: empty);
      }
      break;
    case 'SplitOperation':
      rootType = serverSchema.getType(node.type.name);
      break;
    case 'Fragment':
      rootType =
        serverSchema.getType(node.type.name) ??
        clientSchema.getType(node.type.name);
      break;
    default:
      (node: empty);
  }
  if (rootType == null) {
    throw createUserError(
      `ClientExtensionTransform: Expected the type of \`${
        node.name
      }\` to have been defined in the schema. Make sure both server and ` +
        'client schema are up to date.',
      [node.loc],
    );
  }
  return traverseSelections(node, compilerContext, rootType);
}

function traverseSelections<T: Node>(
  node: T,
  compilerContext: GraphQLCompilerContext,
  parentType: GraphQLType,
): T {
  let nodeCache = cachesByNode.get(node);
  if (nodeCache == null) {
    nodeCache = new Map();
    cachesByNode.set(node, nodeCache);
  }
  let result = nodeCache.get(parentType);
  if (result != null) {
    // $FlowFixMe - TODO: type IRTransformer to allow changing result type
    return result;
  }
  const {serverSchema, clientSchema} = compilerContext;
  const clientSelections = [];
  const serverSelections = cowMap(node.selections, selection => {
    switch (selection.kind) {
      case 'ClientExtension':
        throw createCompilerError(
          'Unexpected ClientExtension node before ClientExtensionTransform',
          [selection.loc],
        );
      case 'Condition':
      case 'Connection':
      case 'Defer':
      case 'InlineDataFragmentSpread':
      case 'ModuleImport':
      case 'Stream':
        return traverseSelections(selection, compilerContext, parentType);
      case 'ScalarField':
        if (isClientDefinedField(selection, compilerContext, parentType)) {
          clientSelections.push(selection);
          return null;
        } else {
          return selection;
        }
      case 'ConnectionField':
      case 'LinkedField': {
        if (isClientDefinedField(selection, compilerContext, parentType)) {
          clientSelections.push(selection);
          return null;
        }
        const rawType = getRawType(selection.type);
        const fieldType =
          serverSchema.getType(rawType.name) ??
          clientSchema.getType(rawType.name);
        if (fieldType == null) {
          throw createCompilerError(
            'ClientExtensionTransform: Expected to be able to determine ' +
              `type of field \`${selection.name}\`.`,
            [selection.loc],
          );
        }
        return traverseSelections(selection, compilerContext, fieldType);
      }
      case 'InlineFragment': {
        const typeName = selection.typeCondition.name;
        const serverType = serverSchema.getType(typeName);
        const clientType = clientSchema.getType(typeName);
        const isClientType = serverType == null && clientType != null;

        if (isClientType) {
          clientSelections.push(selection);
          return null;
        }
        const type = serverType ?? clientType;
        if (type == null) {
          throw createCompilerError(
            'ClientExtensionTransform: Expected to be able to determine ' +
              `type of inline fragment on \`${typeName}\`.`,
            [selection.loc],
          );
        }
        return traverseSelections(selection, compilerContext, type);
      }
      case 'FragmentSpread': {
        const fragment = compilerContext.getFragment(
          selection.name,
          selection.loc,
        );
        const typeName = fragment.type.name;
        const serverType = serverSchema.getType(typeName);
        const clientType = clientSchema.getType(typeName);
        const isClientType = serverType == null && clientType != null;

        if (isClientType) {
          clientSelections.push(selection);
          return null;
        }
        return selection;
      }
      default:
        (selection: empty);
        throw createCompilerError(
          `ClientExtensionTransform: Unexpected selection of kind \`${
            selection.kind
          }\`.`,
          [selection.loc],
        );
    }
  });
  if (clientSelections.length === 0) {
    if (serverSelections === node.selections) {
      result = node;
    } else {
      result = {
        ...node,
        selections: serverSelections,
      };
    }
  } else {
    result = {
      ...node,
      selections: [
        ...serverSelections,
        // Group client fields under a single ClientExtension node
        {
          kind: 'ClientExtension',
          loc: node.loc,
          metadata: null,
          selections: clientSelections,
        },
      ],
    };
  }
  nodeCache.set(parentType, result);
  // $FlowFixMe - TODO: type IRTransformer to allow changing result type
  return result;
}

/**
 * Maps an array with copy-on-write semantics.
 * `null` return values from the map function are removals.
 */
function cowMap(
  selections: $ReadOnlyArray<Selection>,
  f: Selection => Selection | null,
) {
  for (let i = 0; i < selections.length; i++) {
    const prevSelection = selections[i];
    const nextSelection = f(prevSelection);
    if (prevSelection !== nextSelection) {
      const result = selections.slice(0, i);
      if (nextSelection != null) {
        result.push(nextSelection);
      }
      for (let j = i + 1; j < selections.length; j++) {
        const innerNextSelection = f(selections[j]);
        if (innerNextSelection != null) {
          result.push(innerNextSelection);
        }
      }
      return result;
    }
  }
  // nothing changed, return original
  return selections;
}

module.exports = {
  transform: clientExtensionTransform,
};
