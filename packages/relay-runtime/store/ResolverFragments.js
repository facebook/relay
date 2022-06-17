/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import type {GraphQLTaggedNode} from '../query/GraphQLTag';
import type {FragmentType, SingularReaderSelector} from './RelayStoreTypes';
import type {ResolverFragmentResult} from './ResolverCache';

const {getFragment} = require('../query/GraphQLTag');
const {getSelector} = require('./RelayModernSelector');
const invariant = require('invariant');

// When we call the user-supplied resolver function, it will in turn call
// `readFragment`, but that's a global function -- it needs information
// about what resolver is being executed, which is supplied by putting the
// info on this stack before we call the resolver function.
type ResolverContext = {
  getDataForResolverFragment: (
    SingularReaderSelector,
    FragmentType,
  ) => ResolverFragmentResult,
};
const contextStack: Array<ResolverContext> = [];

function withResolverContext<T>(context: ResolverContext, cb: () => T): T {
  contextStack.push(context);
  try {
    return cb();
  } finally {
    contextStack.pop();
  }
}

// NOTE: these declarations are copied from 'useFragment'; it would be good
// to figure out how to share the same type signature between the two functions.
// The declarations ensure that the type of the returned data is:
//   - non-nullable if the provided ref type is non-nullable
//   - nullable if the provided ref type is nullable
//   - array of non-nullable if the provided ref type is an array of
//     non-nullable refs
//   - array of nullable if the provided ref type is an array of nullable refs

declare function readFragment<
  TKey: {+$data?: mixed, +$fragmentSpreads: FragmentType, ...},
>(
  fragmentInput: GraphQLTaggedNode,
  fragmentKey: TKey,
): $Call<<TFragmentData>({+$data?: TFragmentData, ...}) => TFragmentData, TKey>;

declare function readFragment<
  TKey: ?{+$data?: mixed, +$fragmentSpreads: FragmentType, ...},
>(
  fragmentInput: GraphQLTaggedNode,
  fragmentKey: TKey,
): $Call<
  <TFragmentData>(?{+$data?: TFragmentData, ...}) => ?TFragmentData,
  TKey,
>;

declare function readFragment<
  TKey: $ReadOnlyArray<{
    +$data?: mixed,
    +$fragmentSpreads: FragmentType,
    ...
  }>,
>(
  fragmentInput: GraphQLTaggedNode,
  fragmentKey: TKey,
): $Call<
  <TFragmentData>(
    $ReadOnlyArray<{+$data?: TFragmentData, ...}>,
  ) => TFragmentData,
  TKey,
>;

declare function readFragment<
  TKey: ?$ReadOnlyArray<{
    +$data?: mixed,
    +$fragmentSpreads: FragmentType,
    ...
  }>,
>(
  fragmentInput: GraphQLTaggedNode,
  fragmentKey: TKey,
): $Call<
  <TFragmentData>(
    ?$ReadOnlyArray<{+$data?: TFragmentData, ...}>,
  ) => ?TFragmentData,
  TKey,
>;

function readFragment(
  fragmentInput: GraphQLTaggedNode,
  fragmentKey: FragmentType,
): mixed {
  if (!contextStack.length) {
    throw new Error(
      'readFragment should be called only from within a Relay Resolver function.',
    );
  }
  const context = contextStack[contextStack.length - 1];
  const fragmentNode = getFragment(fragmentInput);
  const fragmentSelector = getSelector(fragmentNode, fragmentKey);
  invariant(
    fragmentSelector != null,
    `Expected a selector for the fragment of the resolver ${fragmentNode.name}, but got null.`,
  );
  invariant(
    fragmentSelector.kind === 'SingularReaderSelector',
    `Expected a singular reader selector for the fragment of the resolver ${fragmentNode.name}, but it was plural.`,
  );
  const {data, isMissingData} = context.getDataForResolverFragment(
    fragmentSelector,
    fragmentKey,
  );

  if (isMissingData) {
    throw RESOLVER_FRAGMENT_MISSING_DATA_SENTINEL;
  }

  return data;
}

const RESOLVER_FRAGMENT_MISSING_DATA_SENTINEL: mixed = {};

module.exports = {
  readFragment,
  withResolverContext,
  RESOLVER_FRAGMENT_MISSING_DATA_SENTINEL,
};
