/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayFlattenTransform
 */

'use strict';

const RelayCompilerContext = require('RelayCompilerContext');
const RelaySchemaUtils = require('RelaySchemaUtils');

const areEqual = require('areEqual');
const getIdentifierForRelaySelection = require('getIdentifierForRelaySelection');
const invariant = require('invariant');
const stableJSONStringify = require('stableJSONStringify');

const {
  GraphQLNonNull,
  GraphQLList,
} = require('graphql');

import type {
  Field,
  Handle,
  Node,
  Root,
  ScalarField,
  Selection,
} from 'RelayIR';
import type {
  GraphQLType as Type,
} from 'graphql';

const {getRawType, isAbstractType} = RelaySchemaUtils;

export type FlattenOptions = {
  flattenAbstractTypes?: boolean,
  flattenFragmentSpreads?: boolean,
  flattenInlineFragments?: boolean,
  flattenConditions?: boolean,
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
 *
 * Fragment spreads are inlined when the `flattenFragmentSpreads` option is set.
 * In this case the fragment is converted to an inline fragment, which is
 * then inlined according to the rules above.
 *
 * Conditions are inlined when the `flattenConditions` option is set.
 * In this case the condition is converted to an inline fragment, which is then
 * inlined according to the rules above.
 */
function transform(
  context: RelayCompilerContext,
  options?: FlattenOptions
): RelayCompilerContext {
  const flattenOptions = {
    flattenAbstractTypes: !!(options && options.flattenAbstractTypes),
    flattenFragmentSpreads: !!(options && options.flattenFragmentSpreads),
    flattenInlineFragments: !!(options && options.flattenInlineFragments),
    flattenConditions: !!(options && options.flattenConditions),
  };
  return context.documents().reduce((ctx, node) => {
    if (flattenOptions.flattenFragmentSpreads && node.kind === 'Fragment') {
      return ctx;
    }
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
      'RelayFlattenTransform: Expected Root `%s` to flatten back to a Root ' +
      ' or Fragment.',
      node.name
    );
    return ctx.add(flattenedNode);
  }, new RelayCompilerContext(context.schema));
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
          'RelayFlattenTransform: got a `%s`, expected a selection.',
          node.kind
        );
        return node;
      } else {
        // $FlowIssue: this is provably unreachable
        invariant(
          false,
          'RelayFlattenTransform: Unexpected kind `%s`.',
          selectionState.kind
        );
      }
    }),
  };
}

/**
 * @internal
 */
function visitNode(
  context: RelayCompilerContext,
  options: FlattenOptions,
  state: FlattenState,
  node: Node
): void {
  node.selections.forEach(selection => {
    if (
      selection.kind === 'FragmentSpread' &&
      options.flattenFragmentSpreads
    ) {
      invariant(
        !selection.args.length,
        'RelayFlattenTransform: Cannot flatten fragment spread `%s` with ' +
        'arguments. Use the `ApplyFragmentArgumentTransform` before flattening',
        selection.name
      );
      const fragment = context.get(selection.name);
      invariant(
        fragment && fragment.kind === 'Fragment',
        'RelayFlattenTransform: Unknown fragment `%s`.',
        selection.name
      );
      // Replace the spread with an inline fragment containing the fragment's
      // contents
      selection = {
        directives: selection.directives,
        kind: 'InlineFragment',
        selections: fragment.selections,
        typeCondition: fragment.type,
      };
    }
    if (selection.kind === 'Condition' && options.flattenConditions) {
      selection = {
        directives: [],
        kind: 'InlineFragment',
        selections: selection.selections,
        typeCondition: state.type,
      };
    }
    if (
      selection.kind === 'InlineFragment' &&
      shouldFlattenFragment(selection, options, state)
    ) {
      visitNode(context, options, state, selection);
      return;
    }
    const nodeIdentifier = getIdentifierForRelaySelection(selection);
    if (selection.kind === 'Condition' || selection.kind === 'InlineFragment') {
      let selectionState = state.selections[nodeIdentifier];
      if (!selectionState) {
        selectionState = state.selections[nodeIdentifier] = {
          kind: 'FlattenState',
          node: selection,
          selections: {},
          type: selection.kind === 'InlineFragment' ?
            selection.typeCondition :
            selection.type,
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
        const prevSelection = selectionState.node;
        // Validate unique args for a given alias
        invariant(
          areEqualFields(selection, prevSelection),
          'RelayFlattenTransform: Expected all fields with the alias `%s` ' +
          'to have the same name/arguments. Got `%s` and `%s`.',
          nodeIdentifier,
          showField(selection),
          showField(prevSelection)
        );
        // merge fields
        const handles = dedupe(prevSelection.handles, selection.handles);
        selectionState.node = {
          ...selection,
          handles,
        };
      }
      visitNode(context, options, selectionState, selection);
    } else if (selection.kind === 'ScalarField') {
      const prevSelection = state.selections[nodeIdentifier];
      if (prevSelection) {
        invariant(
          areEqualFields(selection, prevSelection),
          'RelayFlattenTransform: Expected all fields with the alias `%s` ' +
          'to have the same name/arguments. Got `%s` and `%s`.',
          nodeIdentifier,
          showField(selection),
          showField(prevSelection)
        );
        if (selection.handles || prevSelection.handles) {
          const handles = dedupe(selection.handles, prevSelection.handles);
          selection = {
            ...selection,
            handles,
          };
        }
      }
      state.selections[nodeIdentifier] = selection;
    } else {
      invariant(
        false,
        'RelayFlattenTransform: Unknown kind `%s`.',
        selection.kind
      );
    }
  });
}

/**
 * @internal
 */
function shouldFlattenFragment(
  fragment: InlineFragment,
  options: FlattenOptions,
  state: FlattenState
): boolean {
  // Right now, both the fragment's and state's types could be undefined.
  if (!fragment.typeCondition) {
    return !state.type;
  } else if (!state.type) {
    return false;
  }
  return (
    isEquivalentType(fragment.typeCondition, state.type) ||
    options.flattenInlineFragments ||
    (
      options.flattenAbstractTypes &&
      isAbstractType(getRawType(fragment.typeCondition))
    )
  );
}

/**
 * @internal
 */
function showField(field: Field) {
  const alias = field.alias ? field.alias + ' ' : '';
  return `${alias}${field.name}(${JSON.stringify(field.args)})`;
}

/**
 * @internal
 *
 * Verify that two fields are equal in all properties other than their
 * selections.
 */
function areEqualFields(
  thisField: Field,
  thatField: Field
): boolean {
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
    items && items.forEach(item => {
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

module.exports = {transform};
