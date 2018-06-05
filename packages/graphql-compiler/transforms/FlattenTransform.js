/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict';

const GraphQLCompilerContext = require('../core/GraphQLCompilerContext');
const GraphQLIRTransformer = require('../core/GraphQLIRTransformer');
const GraphQLSchemaUtils = require('../core/GraphQLSchemaUtils');

const areEqual = require('../util/areEqualOSS');
const getIdentifierForSelection = require('../core/getIdentifierForSelection');
const invariant = require('invariant');

const {createUserError} = require('../core/GraphQLCompilerUserError');
const {printField} = require('../core/GraphQLIRPrinter');

import type {
  Condition,
  Field,
  Fragment,
  Handle,
  InlineFragment,
  Root,
  ScalarField,
  LinkedField,
  Selection,
} from '../core/GraphQLIR';
import type {GraphQLType} from 'graphql';

const {getRawType, isAbstractType} = GraphQLSchemaUtils;

export type FlattenOptions = {
  flattenAbstractTypes?: boolean,
  flattenInlineFragments?: boolean,
};

type State = {
  flattenAbstractTypes: boolean,
  flattenInlineFragments: boolean,
  parentType: ?GraphQLType,
};

type HasSelections = Root | Fragment | Condition | InlineFragment | LinkedField;

/**
 * Transform that flattens inline fragments, fragment spreads, and conditionals.
 *
 * Inline fragments are inlined (replaced with their selections) when:
 * - The fragment type matches the type of its parent.
 * - The fragment has an abstract type and the `flattenAbstractTypes` option has
 *   been set.
 * - The 'flattenInlineFragments' option has been set.
 */
function flattenTransformImpl(
  context: GraphQLCompilerContext,
  options?: FlattenOptions,
): GraphQLCompilerContext {
  const state = {
    flattenAbstractTypes: !!(options && options.flattenAbstractTypes),
    flattenInlineFragments: !!(options && options.flattenInlineFragments),
    parentType: null,
  };

  return GraphQLIRTransformer.transform(
    context,
    {
      Root: flattenSelections,
      Fragment: flattenSelections,
      Condition: flattenSelections,
      InlineFragment: flattenSelections,
      LinkedField: flattenSelections,
    },
    () => state,
  );
}

/**
 * @internal
 */
function flattenSelections<T: HasSelections>(node: T, state: State): T {
  // Determine the current type.
  const parentType = state.parentType;
  const type =
    node.kind === 'Condition'
      ? parentType
      : node.kind === 'InlineFragment'
        ? node.typeCondition
        : node.type;
  invariant(type, 'FlattenTransform: Expected parent type.');

  // Flatten the selections in this node, creating a new node with flattened
  // selections if possible, then deeply traverse the flattened node, while
  // keeping track of the parent type.
  const nextSelections = new Map();
  const hasFlattened = flattenSelectionsInto(nextSelections, node, state, type);
  const flattenedNode = hasFlattened
    ? {...node, selections: Array.from(nextSelections.values())}
    : node;
  state.parentType = type;
  const deeplyFlattenedNode = this.traverse(flattenedNode, state);
  state.parentType = parentType;
  return deeplyFlattenedNode;
}

/**
 * @internal
 */
function flattenSelectionsInto(
  flattenedSelections: Map<string, Selection>,
  node: HasSelections,
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
      invariant(
        selection.kind === 'InlineFragment',
        'FlattenTransform: Expected a ScalarField, got a %s',
        selection.kind,
      );
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
      invariant(
        selection.kind === 'Condition',
        'FlattenTransform: Expected a Condition, got a %s',
        selection.kind,
      );
      flattenedSelections.set(nodeIdentifier, {
        ...flattenedSelection,
        selections: mergeSelections(flattenedSelection, selection, state, type),
      });
    } else if (
      flattenedSelection.kind === 'FragmentSpread' ||
      flattenedSelection.kind === 'DeferrableFragmentSpread'
    ) {
      // Ignore duplicate fragment spreads.
    } else if (flattenedSelection.kind === 'LinkedField') {
      invariant(
        selection.kind === 'LinkedField',
        'FlattenTransform: Expected a LinkedField, got a %s',
        selection.kind,
      );
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
      invariant(
        selection.kind === 'ScalarField',
        'FlattenTransform: Expected a ScalarField, got a %s',
        selection.kind,
      );
      // Note: arguments are intentionally reversed to avoid rebuilds
      assertUniqueArgsForAlias(selection, flattenedSelection);
      flattenedSelections.set(nodeIdentifier, {
        kind: 'ScalarField',
        ...flattenedSelection,
        // Note: arguments are intentionally reversed to avoid rebuilds
        handles: mergeHandles(selection, flattenedSelection),
      });
    } else {
      invariant(
        false,
        'FlattenTransform: Unknown kind `%s`.',
        (flattenedSelection.kind: empty),
      );
    }
  });
  return hasFlattened;
}

/**
 * @internal
 */
function mergeSelections(
  nodeA: HasSelections,
  nodeB: HasSelections,
  state: State,
  type: GraphQLType,
): Array<Selection> {
  const flattenedSelections = new Map();
  flattenSelectionsInto(flattenedSelections, nodeA, state, type);
  flattenSelectionsInto(flattenedSelections, nodeB, state, type);
  return Array.from(flattenedSelections.values());
}

/**
 * @internal
 * TODO(T19327202) This is redundant with OverlappingFieldsCanBeMergedRule once
 * it can be enabled.
 */
function assertUniqueArgsForAlias(field: Field, otherField: Field): void {
  if (!areEqualFields(field, otherField)) {
    throw createUserError(
      'Expected all fields on the same parent with the name or alias `%s` ' +
        'to have the same name and arguments. Got `%s` and `%s`.',
      field.alias || field.name,
      printField(field),
      printField(otherField),
    );
  }
}

/**
 * @internal
 */
function shouldFlattenInlineFragment(
  fragment: InlineFragment,
  state: State,
  type: GraphQLType,
): boolean {
  return (
    state.flattenInlineFragments ||
    fragment.typeCondition.name === getRawType(type).name ||
    (state.flattenAbstractTypes && isAbstractType(fragment.typeCondition))
  );
}

/**
 * @internal
 *
 * Verify that two fields are equal in all properties other than their
 * selections.
 */
function areEqualFields(thisField: Field, thatField: Field): boolean {
  return (
    thisField.kind === thatField.kind &&
    thisField.name === thatField.name &&
    thisField.alias === thatField.alias &&
    areEqual(thisField.args, thatField.args)
  );
}

/**
 * @internal
 */
function mergeHandles<T: LinkedField | ScalarField>(
  nodeA: T,
  nodeB: T,
): ?Array<Handle> {
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

function transformWithOptions(options: FlattenOptions) {
  return function flattenTransform(
    context: GraphQLCompilerContext,
  ): GraphQLCompilerContext {
    return flattenTransformImpl(context, options);
  };
}

module.exports = {
  transformWithOptions,
};
