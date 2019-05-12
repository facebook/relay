/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict';

import type {
  Argument,
  Field,
  Handle,
  InlineFragment,
  LinkedField,
  Node,
  ScalarField,
  Selection,
} from '../core/GraphQLIR';
import type {GraphQLType} from 'graphql';

const getIdentifierForSelection = require('../core/getIdentifierForSelection');
const GraphQLCompilerContext = require('../core/GraphQLCompilerContext');
const GraphQLIRTransformer = require('../core/GraphQLIRTransformer');
const GraphQLSchemaUtils = require('../core/GraphQLSchemaUtils');
const {
  createCompilerError,
  createUserError,
} = require('../core/RelayCompilerError');
const areEqual = require('../util/areEqualOSS');

const {getRawType, isAbstractType} = GraphQLSchemaUtils;

export type FlattenOptions = {
  flattenAbstractTypes?: boolean,
};

type State = {
  flattenAbstractTypes: boolean,
  parentType: ?GraphQLType,
};

/**
 * Transform that flattens inline fragments, fragment spreads, and conditionals.
 *
 * Inline fragments are inlined (replaced with their selections) when:
 * - The fragment type matches the type of its parent.
 * - The fragment has an abstract type and the `flattenAbstractTypes` option has
 *   been set.
 */
function flattenTransformImpl(
  context: GraphQLCompilerContext,
  options?: FlattenOptions,
): GraphQLCompilerContext {
  const state = {
    flattenAbstractTypes: !!(options && options.flattenAbstractTypes),
    parentType: null,
  };
  const visitorFn = memoizedFlattenSelection(new Map());
  return GraphQLIRTransformer.transform(
    context,
    {
      Root: visitorFn,
      Fragment: visitorFn,
      Condition: visitorFn,
      InlineFragment: visitorFn,
      LinkedField: visitorFn,
      SplitOperation: visitorFn,
    },
    () => state,
  );
}

function memoizedFlattenSelection(cache) {
  return function flattenSelectionsFn<T: Node>(node: T, state: State): T {
    let nodeCache = cache.get(node);
    if (nodeCache == null) {
      nodeCache = new Map();
      cache.set(node, nodeCache);
    }
    // Determine the current type.
    const parentType = state.parentType;
    const result = nodeCache.get(parentType);
    if (result != null) {
      return result;
    }

    const type =
      node.kind === 'LinkedField' ||
      node.kind === 'Fragment' ||
      node.kind === 'Root' ||
      node.kind === 'SplitOperation'
        ? node.type
        : node.kind === 'InlineFragment'
        ? node.typeCondition
        : parentType;
    if (type == null) {
      throw createCompilerError('FlattenTransform: Expected a parent type.', [
        node.loc,
      ]);
    }

    // Flatten the selections in this node, creating a new node with flattened
    // selections if possible, then deeply traverse the flattened node, while
    // keeping track of the parent type.
    const nextSelections = new Map();
    const hasFlattened = flattenSelectionsInto(
      nextSelections,
      node,
      state,
      type,
    );
    const flattenedNode = hasFlattened
      ? {...node, selections: Array.from(nextSelections.values())}
      : node;
    state.parentType = type;
    const deeplyFlattenedNode = this.traverse(flattenedNode, state);
    state.parentType = parentType;
    nodeCache.set(parentType, deeplyFlattenedNode);
    return deeplyFlattenedNode;
  };
}

/**
 * @private
 */
function flattenSelectionsInto(
  flattenedSelections: Map<string, Selection>,
  node: Node,
  state: State,
  type: GraphQLType,
): boolean {
  let hasFlattened = false;
  node.selections.forEach(selection => {
    if (
      selection.kind === 'InlineFragment' &&
      shouldFlattenInlineFragment(selection, state, type)
    ) {
      hasFlattened = true;
      flattenSelectionsInto(flattenedSelections, selection, state, type);
      return;
    }
    const nodeIdentifier = getIdentifierForSelection(selection);
    const flattenedSelection = flattenedSelections.get(nodeIdentifier);
    // If this selection hasn't been seen before, keep track of it.
    if (!flattenedSelection) {
      flattenedSelections.set(nodeIdentifier, selection);
      return;
    }
    // Otherwise a similar selection exists which should be merged.
    hasFlattened = true;
    if (flattenedSelection.kind === 'InlineFragment') {
      if (selection.kind !== 'InlineFragment') {
        throw createCompilerError(
          `FlattenTransform: Expected an InlineFragment, got a '${
            selection.kind
          }'`,
          [selection.loc],
        );
      }
      flattenedSelections.set(nodeIdentifier, {
        ...flattenedSelection,
        selections: mergeSelections(
          flattenedSelection,
          selection,
          state,
          selection.typeCondition,
        ),
      });
    } else if (flattenedSelection.kind === 'Condition') {
      if (selection.kind !== 'Condition') {
        throw createCompilerError(
          `FlattenTransform: Expected a Condition, got a '${selection.kind}'`,
          [selection.loc],
        );
      }
      flattenedSelections.set(nodeIdentifier, {
        ...flattenedSelection,
        selections: mergeSelections(flattenedSelection, selection, state, type),
      });
    } else if (flattenedSelection.kind === 'ClientExtension') {
      if (selection.kind !== 'ClientExtension') {
        throw createCompilerError(
          `FlattenTransform: Expected a ClientExtension, got a '${
            selection.kind
          }'`,
          [selection.loc],
        );
      }
      flattenedSelections.set(nodeIdentifier, {
        ...flattenedSelection,
        selections: mergeSelections(flattenedSelection, selection, state, type),
      });
    } else if (flattenedSelection.kind === 'FragmentSpread') {
      // Ignore duplicate fragment spreads.
    } else if (flattenedSelection.kind === 'ModuleImport') {
      if (selection.kind !== 'ModuleImport') {
        throw createCompilerError(
          `FlattenTransform: Expected a ModuleImport, got a '${
            selection.kind
          }'`,
          [selection.loc],
        );
      }
      if (
        selection.name !== flattenedSelection.name ||
        selection.module !== flattenedSelection.module
      ) {
        throw createUserError(
          'Found conflicting @module selections: use a unique alias on the ' +
            'parent fields.',
          [selection.loc, flattenedSelection.loc],
        );
      }
      flattenedSelections.set(nodeIdentifier, {
        ...flattenedSelection,
        selections: mergeSelections(flattenedSelection, selection, state, type),
      });
    } else if (flattenedSelection.kind === 'Defer') {
      if (selection.kind !== 'Defer') {
        throw createCompilerError(
          `FlattenTransform: Expected a Defer, got a '${selection.kind}'`,
          [selection.loc],
        );
      }
      flattenedSelections.set(nodeIdentifier, {
        kind: 'Defer',
        ...flattenedSelection,
        selections: mergeSelections(flattenedSelection, selection, state, type),
      });
    } else if (flattenedSelection.kind === 'Stream') {
      if (selection.kind !== 'Stream') {
        throw createCompilerError(
          `FlattenTransform: Expected a Stream, got a '${selection.kind}'`,
          [selection.loc],
        );
      }
      flattenedSelections.set(nodeIdentifier, {
        kind: 'Stream',
        ...flattenedSelection,
        selections: mergeSelections(flattenedSelection, selection, state, type),
      });
    } else if (flattenedSelection.kind === 'LinkedField') {
      if (selection.kind !== 'LinkedField') {
        throw createCompilerError(
          `FlattenTransform: Expected a LinkedField, got a '${selection.kind}'`,
          [selection.loc],
        );
      }
      // Note: arguments are intentionally reversed to avoid rebuilds
      assertUniqueArgsForAlias(selection, flattenedSelection);
      flattenedSelections.set(nodeIdentifier, {
        kind: 'LinkedField',
        ...flattenedSelection,
        handles: mergeHandles(flattenedSelection, selection),
        selections: mergeSelections(
          flattenedSelection,
          selection,
          state,
          selection.type,
        ),
      });
    } else if (flattenedSelection.kind === 'ScalarField') {
      if (selection.kind !== 'ScalarField') {
        throw createCompilerError(
          `FlattenTransform: Expected a ScalarField, got a '${selection.kind}'`,
          [selection.loc],
        );
      }
      // Note: arguments are intentionally reversed to avoid rebuilds
      assertUniqueArgsForAlias(selection, flattenedSelection);
      flattenedSelections.set(nodeIdentifier, {
        kind: 'ScalarField',
        ...flattenedSelection,
        // Note: arguments are intentionally reversed to avoid rebuilds
        handles: mergeHandles(selection, flattenedSelection),
      });
    } else {
      (flattenedSelection.kind: empty);
      throw createCompilerError(
        `FlattenTransform: Unknown kind '${flattenedSelection.kind}'`,
      );
    }
  });
  return hasFlattened;
}

/**
 * @private
 */
function mergeSelections(
  nodeA: Node,
  nodeB: Node,
  state: State,
  type: GraphQLType,
): Array<Selection> {
  const flattenedSelections = new Map();
  flattenSelectionsInto(flattenedSelections, nodeA, state, type);
  flattenSelectionsInto(flattenedSelections, nodeB, state, type);
  return Array.from(flattenedSelections.values());
}

/**
 * @private
 * TODO(T19327202) This is redundant with OverlappingFieldsCanBeMergedRule once
 * it can be enabled.
 */
function assertUniqueArgsForAlias(field: Field, otherField: Field): void {
  if (!areEqualFields(field, otherField)) {
    throw createUserError(
      'Expected all fields on the same parent with ' +
        `the name or alias '${field.alias ??
          field.name}' to have the same name and arguments.`,
      [field.loc, otherField.loc],
    );
  }
}

/**
 * @private
 */
function shouldFlattenInlineFragment(
  fragment: InlineFragment,
  state: State,
  type: GraphQLType,
): boolean {
  return (
    fragment.typeCondition.name === getRawType(type).name ||
    (state.flattenAbstractTypes && isAbstractType(fragment.typeCondition))
  );
}

/**
 * @private
 *
 * Verify that two fields are equal in all properties other than their
 * selections.
 */
function areEqualFields(thisField: Field, thatField: Field): boolean {
  return (
    thisField.kind === thatField.kind &&
    thisField.name === thatField.name &&
    thisField.alias === thatField.alias &&
    areEqualArgs(thisField.args, thatField.args)
  );
}

/**
 * Verify that two sets of arguments are equivalent - same argument names
 * and values. Notably this ignores the types of arguments and values, which
 * may not always be inferred identically.
 */
function areEqualArgs(
  thisArgs: $ReadOnlyArray<Argument>,
  thatArgs: $ReadOnlyArray<Argument>,
): boolean {
  return (
    thisArgs.length === thatArgs.length &&
    thisArgs.every((thisArg, index) => {
      const thatArg = thatArgs[index];
      return (
        thisArg.name === thatArg.name &&
        thisArg.value.kind === thatArg.value.kind &&
        (thisArg.value: any).variableName ===
          (thatArg.value: any).variableName &&
        areEqual((thisArg.value: any).value, (thatArg.value: any).value)
      );
    })
  );
}

/**
 * @private
 */
function mergeHandles<T: LinkedField | ScalarField>(
  nodeA: T,
  nodeB: T,
): ?$ReadOnlyArray<Handle> {
  if (!nodeA.handles) {
    return nodeB.handles;
  }
  if (!nodeB.handles) {
    return nodeA.handles;
  }
  const uniqueItems = new Map();
  nodeA.handles
    .concat(nodeB.handles)
    .forEach(item => uniqueItems.set(item.name + item.key, item));
  return Array.from(uniqueItems.values());
}

function transformWithOptions(
  options: FlattenOptions,
): (context: GraphQLCompilerContext) => GraphQLCompilerContext {
  return function flattenTransform(
    context: GraphQLCompilerContext,
  ): GraphQLCompilerContext {
    return flattenTransformImpl(context, options);
  };
}

module.exports = {
  transformWithOptions,
};
