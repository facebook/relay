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
  const serverSelections = [];
  node.selections.forEach(selection => {
    switch (selection.kind) {
      case 'ClientExtension': {
        serverSelections.push(selection);
        break;
      }
      case 'Condition':
      case 'Defer':
      case 'InlineDataFragmentSpread':
      case 'ModuleImport':
      case 'Stream': {
        const transformed = traverseSelections(
          selection,
          compilerContext,
          parentType,
        );
        serverSelections.push(transformed);
        break;
      }
      case 'ConnectionField':
      case 'ScalarField':
      case 'LinkedField': {
        const isClientField = isClientDefinedField(
          selection,
          compilerContext,
          parentType,
        );

        if (isClientField) {
          clientSelections.push(selection);
          break;
        }
        if (selection.kind === 'ScalarField') {
          serverSelections.push(selection);
        } else {
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
          const transformed = traverseSelections(
            selection,
            compilerContext,
            fieldType,
          );
          serverSelections.push(transformed);
        }
        break;
      }
      case 'InlineFragment': {
        const typeName = selection.typeCondition.name;
        const serverType = serverSchema.getType(typeName);
        const clientType = clientSchema.getType(typeName);
        const isClientType = serverType == null && clientType != null;

        if (isClientType) {
          clientSelections.push(selection);
        } else {
          const type = serverType ?? clientType;
          if (type == null) {
            throw createCompilerError(
              'ClientExtensionTransform: Expected to be able to determine ' +
                `type of inline fragment on \`${typeName}\`.`,
              [selection.loc],
            );
          }
          const transformed = traverseSelections(
            selection,
            compilerContext,
            type,
          );
          serverSelections.push(transformed);
        }
        break;
      }
      case 'FragmentSpread': {
        if (!compilerContext.get(selection.name)) {
          // NOTE: Calling `get` will check if the fragment definition for this
          // fragment spread exists. If it doesn't, which can happen if the
          // fragment spread is referencing a fragment defined with Relay Classic,
          // we will treat this selection as a client-only selection
          // This will ensure that it is properly skipped for the print context.
          clientSelections.push(selection);
          break;
        }
        const fragment = compilerContext.getFragment(selection.name);
        const typeName = fragment.type.name;
        const serverType = serverSchema.getType(typeName);
        const clientType = clientSchema.getType(typeName);
        const isClientType = serverType == null && clientType != null;

        if (isClientType) {
          clientSelections.push(selection);
        } else {
          serverSelections.push(selection);
        }
        break;
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
  result =
    clientSelections.length === 0
      ? {
          ...node,
          selections: [...serverSelections],
        }
      : {
          ...node,
          selections: [
            ...serverSelections,
            // Group client fields under a single ClientExtension node
            {
              kind: 'ClientExtension',
              loc: node.loc,
              metadata: null,
              selections: [...clientSelections],
            },
          ],
        };
  nodeCache.set(parentType, result);
  // $FlowFixMe - TODO: type IRTransformer to allow changing result type
  return result;
}

module.exports = {
  transform: clientExtensionTransform,
};
