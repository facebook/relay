/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule flattenRelayQuery
 * @flow
 * @typechecks
 */

'use strict';

const Map = require('Map');
const RelayProfiler = require('RelayProfiler');
const RelayQuery = require('RelayQuery');
const RelayQueryVisitor = require('RelayQueryVisitor');

const sortTypeFirst = require('sortTypeFirst');

type FlattenedQuery = {
  node: RelayQuery.Node;
  type: string;
  flattenedFieldMap: Map<string, FlattenedQuery>;
  flattenedFragmentMap: Map<string, FlattenedQuery>;
};
export type FlattenRelayQueryOptions = {
  preserveEmptyNodes?: boolean;
  shouldRemoveFragments?: boolean;
};

/**
 * @internal
 *
 * `flattenRelayQuery(query)` returns a clone of `query` with fields inside of
 * fragments recursively flattened into the nearest ancestor field.
 *
 * The result can be null if `node` only contains empty fragments or fragments
 * that only contain empty fragments.
 */
function flattenRelayQuery<Tn: RelayQuery.Node>(
  node: Tn,
  options?: FlattenRelayQueryOptions
): ?Tn {
  const flattener = new RelayQueryFlattener(
    options && options.shouldRemoveFragments
  );
  const state = {
    node,
    type: node.getType(),
    flattenedFieldMap: new Map(),
    flattenedFragmentMap: new Map(),
  };
  flattener.traverse(node, state);
  return toQuery(node, state, !!(options && options.preserveEmptyNodes));
}

function toQuery<Tn: RelayQuery.Node>(
  node: Tn,
  {
    flattenedFieldMap,
    flattenedFragmentMap,
  }: FlattenedQuery,
  preserveEmptyNodes: boolean
): ?Tn {
  const children = [];
  const aliases = Array.from(flattenedFieldMap.keys()).sort(sortTypeFirst);
  aliases.forEach(alias => {
    const field = flattenedFieldMap.get(alias);
    if (field) {
      children.push(toQuery(field.node, field, preserveEmptyNodes));
    }
  });
  Array.from(flattenedFragmentMap.keys()).forEach(type => {
    const fragment = flattenedFragmentMap.get(type);
    if (fragment) {
      children.push(toQuery(fragment.node, fragment, preserveEmptyNodes));
    }
  });
  // Pattern nodes may contain non-scalar fields without children that
  // should not be removed.
  if (preserveEmptyNodes && node.canHaveSubselections() && !children.length) {
    return node;
  }
  return node.clone(children);
}

class RelayQueryFlattener extends RelayQueryVisitor<FlattenedQuery> {
  _shouldRemoveFragments: boolean;

  constructor(shouldRemoveFragments: ?boolean) {
    super();
    this._shouldRemoveFragments = !!shouldRemoveFragments;
  }

  visitFragment(
    node: RelayQuery.Fragment,
    state: FlattenedQuery
  ): void {
    const type = node.getType();
    if (this._shouldRemoveFragments || type === state.type) {
      this.traverse(node, state);
      return;
    }
    let flattenedFragment = state.flattenedFragmentMap.get(type);
    if (!flattenedFragment) {
      flattenedFragment = {
        node,
        type,
        flattenedFieldMap: new Map(),
        flattenedFragmentMap: new Map(),
      };
      state.flattenedFragmentMap.set(type, flattenedFragment);
    }
    this.traverse(node, flattenedFragment);
  }

  visitField(
    node: RelayQuery.Field,
    state: FlattenedQuery
  ): void {
    const hash = node.getShallowHash();
    let flattenedField = state.flattenedFieldMap.get(hash);
    if (!flattenedField) {
      flattenedField = {
        node,
        type: node.getType(),
        flattenedFieldMap: new Map(),
        flattenedFragmentMap: new Map(),
      };
      state.flattenedFieldMap.set(hash, flattenedField);
    }
    this.traverse(node, flattenedField);
  }
}

module.exports = RelayProfiler.instrument(
  'flattenRelayQuery',
  flattenRelayQuery
);
