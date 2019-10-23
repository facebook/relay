/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

const useFragmentNode = require('./useFragmentNode');
const useStaticFragmentNodeWarning = require('./useStaticFragmentNodeWarning');

const {getFragment} = require('relay-runtime');

import type {GraphQLTaggedNode} from 'relay-runtime';

// NOTE: These declares ensure that the type of the returned data is:
//   - non-nullable if the provided ref type is non-nullable
//   - nullable if the provided ref type is nullable
//   - array of non-nullable if the privoided ref type is an array of
//     non-nullable refs
//   - array of nullable if the privoided ref type is an array of nullable refs

declare function useFragment<TKey: {+$data?: mixed}>(
  fragmentInput: GraphQLTaggedNode,
  fragmentRef: TKey,
): $Call<<TFragmentData>({+$data?: TFragmentData}) => TFragmentData, TKey>;

declare function useFragment<TKey: ?{+$data?: mixed}>(
  fragmentInput: GraphQLTaggedNode,
  fragmentRef: TKey,
): $Call<<TFragmentData>(?{+$data?: TFragmentData}) => ?TFragmentData, TKey>;

declare function useFragment<TKey: $ReadOnlyArray<{+$data?: mixed}>>(
  fragmentInput: GraphQLTaggedNode,
  fragmentRef: TKey,
): $Call<
  <TFragmentData>($ReadOnlyArray<{+$data?: TFragmentData}>) => TFragmentData,
  TKey,
>;

declare function useFragment<TKey: ?$ReadOnlyArray<{+$data?: mixed}>>(
  fragmentInput: GraphQLTaggedNode,
  fragmentRef: TKey,
): $Call<
  <TFragmentData>(?$ReadOnlyArray<{+$data?: TFragmentData}>) => ?TFragmentData,
  TKey,
>;

function useFragment(
  fragmentInput: GraphQLTaggedNode,
  fragmentRef: ?$ReadOnlyArray<{+$data?: mixed}> | ?{+$data?: mixed},
): mixed {
  const fragmentNode = getFragment(fragmentInput);
  useStaticFragmentNodeWarning(fragmentNode, 'first argument of useFragment()');
  const {data} = useFragmentNode<_>(fragmentNode, fragmentRef, 'useFragment()');
  return data;
}

module.exports = useFragment;
