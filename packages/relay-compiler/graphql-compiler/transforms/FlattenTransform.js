/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule FlattenTransform
 * @format
 */

'use strict';

const GraphQLCompilerContext = require('../core/GraphQLCompilerContext');
const GraphQLSchemaUtils = require('../core/GraphQLSchemaUtils');

const areEqual = require('../util/areEqualOSS');
const getIdentifierForSelection = require('../core/getIdentifierForSelection');
const invariant = require('invariant');
const stableJSONStringify = require('../util/stableJSONStringifyOSS');

const {createUserError} = require('../core/GraphQLCompilerUserError');
const {printField} = require('../core/GraphQLIRPrinter');
const {GraphQLNonNull, GraphQLList} = require('graphql');

import type {
  Field,
  Fragment,
  Handle,
  InlineFragment,
  Node,
  Root,
  ScalarField,
  Selection,
} from '../core/GraphQLIR';
import type {GraphQLType} from 'graphql';

const {getRawType, isAbstractType} = GraphQLSchemaUtils;

export type FlattenOptions = {
  flattenAbstractTypes?: boolean,
  flattenInlineFragments?: boolean,
};
type FlattenState = {
  kind: 'FlattenState',
  node: Node,
  selections: {[key: string]: FlattenState | ScalarField},
  type: Type,
};

/**
 * Transform that flattens inline fragments, fragment spreads, and conditionals.
 *
 * Inline fragments are inlined (replaced with their selections) when:
 * - The fragment type matches the type of its parent.
 * - The fragment has an abstract type and the `flattenAbstractTypes` option has
 *   been set.
 * - The 'flattenInlineFragments' option has been set.
 */
function transform(
  context: GraphQLCompilerContext,
  options?: FlattenOptions,
): GraphQLCompilerContext {
  const flattenOptions = {
    flattenAbstractTypes: !!(options && options.flattenAbstractTypes),
    flattenInlineFragments: !!(options && options.flattenInlineFragments),
  };
  return context
    .documents()
    .reduce(
      (
        ctx: GraphQLCompilerContext,
        node: Root | Fragment,
      ): GraphQLCompilerContext => {
        const state = {
          kind: 'FlattenState',
          node,
          selections: {},
          type: node.type,
        };
        visitNode(context, flattenOptions, state, node);
        const flattenedNode = buildNode(state);
        invariant(
          flattenedNode.kind === 'Root' || flattenedNode.kind === 'Fragment',
          'FlattenTransform: Expected Root `%s` to flatten back to a Root ' +
            ' or Fragment.',
          node.name,
        );
        return ctx.add(flattenedNode);
      },
      new GraphQLCompilerContext(context.schema),
    );
}

function buildNode(state: FlattenState): Root | Selection {
  return {
    ...state.node,
    selections: Object.keys(state.selections).map(key => {
      const selectionState = state.selections[key];
      if (
        selectionState.kind === 'FragmentSpread' ||
        selectionState.kind === 'ScalarField'
      ) {
        return selectionState;
      } else if (selectionState.kind === 'FlattenState') {
        const node = buildNode(selectionState);
        invariant(
          node.kind !== 'Root' && node.kind !== 'Fragment',
          'FlattenTransform: got a `%s`, expected a selection.',
          node.kind,
        );
        return node;
      } else {
        invariant(
          false,
          'FlattenTransform: Unexpected kind `%s`.',
          selectionState.kind,
        );
      }
    }),
  };
}

/**
 * @internal
 */
function visitNode(
  context: GraphQLCompilerContext,
  options: FlattenOptions,
  state: FlattenState,
  node: Node,
): void {
  node.selections.forEach(selection => {
    if (
      selection.kind === 'InlineFragment' &&
      shouldFlattenInlineFragment(selection, options, state)
    ) {
      visitNode(context, options, state, selection);
      return;
    }
    const nodeIdentifier = getIdentifierForSelection(selection);
    if (selection.kind === 'Condition' || selection.kind === 'InlineFragment') {
      let selectionState = state.selections[nodeIdentifier];
      if (!selectionState) {
        selectionState = state.selections[nodeIdentifier] = {
          kind: 'FlattenState',
          node: selection,
          selections: {},
          type:
            selection.kind === 'InlineFragment'
              ? selection.typeCondition
              : state.type,
        };
      }
      visitNode(context, options, selectionState, selection);
    } else if (selection.kind === 'FragmentSpread') {
      state.selections[nodeIdentifier] = selection;
    } else if (selection.kind === 'LinkedField') {
      let selectionState = state.selections[nodeIdentifier];
      if (!selectionState) {
        selectionState = state.selections[nodeIdentifier] = {
          kind: 'FlattenState',
          node: selection,
          selections: {},
          type: selection.type,
        };
      } else {
        invariant(
          selectionState.node.kind === 'LinkedField' ||
            selectionState.node.kind === 'ScalarField',
          'FlattenTransform: Expected a Field, got %s.',
          selectionState.node.kind,
        );
        const prevField: Field = selectionState.node;
        assertUniqueArgsForAlias(selection, prevField);
        // merge fields
        const handles = dedupe(prevField.handles, selection.handles);
        selectionState.node = {
          ...selection,
          handles,
        };
      }
      visitNode(context, options, selectionState, selection);
    } else if (selection.kind === 'ScalarField') {
      let field: ScalarField = selection;
      const prevSelection = state.selections[nodeIdentifier];
      if (
        prevSelection &&
        (prevSelection.kind === 'ScalarField' ||
          prevSelection.kind === 'LinkedField')
      ) {
        const prevField: Field = prevSelection;
        assertUniqueArgsForAlias(field, prevField);
        if (field.handles || prevField.handles) {
          const handles = dedupe(field.handles, prevField.handles);
          field = {
            ...selection,
            handles,
          };
        }
      }
      state.selections[nodeIdentifier] = field;
    } else {
      invariant(false, 'FlattenTransform: Unknown kind `%s`.', selection.kind);
    }
  });
}

/**
 * @internal
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
  options: FlattenOptions,
  state: FlattenState,
): boolean {
  return !!(
    isEquivalentType(fragment.typeCondition, state.type) ||
    options.flattenInlineFragments ||
    (options.flattenAbstractTypes &&
      isAbstractType(getRawType(fragment.typeCondition)))
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
function dedupe(...arrays: Array<?Array<Handle>>): Array<Handle> {
  const uniqueItems = new Map();
  arrays.forEach(items => {
    items &&
      items.forEach(item => {
        uniqueItems.set(stableJSONStringify(item), item);
      });
  });
  return Array.from(uniqueItems.values());
}

/**
 *
 * @internal
 * Determine if a type is the same type (same name and class) as another type.
 * Needed if we're comparing IRs created at different times: we don't yet have
 * an IR schema, so the type we assign to an IR field could be !== than
 * what we assign to it after adding some schema definitions or extensions.
 */
function isEquivalentType(typeA: GraphQLType, typeB: GraphQLType): boolean {
  // Easy short-circuit: equal types are equal.
  if (typeA === typeB) {
    return true;
  }

  // If either type is non-null, the other must also be non-null.
  if (typeA instanceof GraphQLNonNull && typeB instanceof GraphQLNonNull) {
    return isEquivalentType(typeA.ofType, typeB.ofType);
  }

  // If either type is a list, the other must also be a list.
  if (typeA instanceof GraphQLList && typeB instanceof GraphQLList) {
    return isEquivalentType(typeA.ofType, typeB.ofType);
  }

  // Make sure the two types are of the same class
  if (typeA.constructor.name === typeB.constructor.name) {
    const rawA = getRawType(typeA);
    const rawB = getRawType(typeB);

    // And they must have the exact same name
    return rawA.name === rawB.name;
  }

  // Otherwise the types are not equal.
  return false;
}

module.exports = {
  transform,
};
