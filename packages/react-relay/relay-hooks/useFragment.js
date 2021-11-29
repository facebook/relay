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

// flowlint ambiguous-object-type:error

'use strict';

import type {FragmentType, GraphQLTaggedNode} from 'relay-runtime';

const {useTrackLoadQueryInRender} = require('./loadQuery');
const useFragmentNode = require('./useFragmentNode');
const useStaticFragmentNodeWarning = require('./useStaticFragmentNodeWarning');
const {useDebugValue} = require('react');
const {getFragment} = require('relay-runtime');

// if the key is non-nullable, return non-nullable value
declare function useFragment<
  TKey: {+$data?: mixed, +$fragmentSpreads: FragmentType, ...},
>(
  fragment: GraphQLTaggedNode,
  key: TKey,
): $Call<<TData>({+$data?: TData, ...}) => TData, TKey>;

// if the key is nullable, return nullable value
declare function useFragment<
  TKey: ?{+$data?: mixed, +$fragmentSpreads: FragmentType, ...},
>(
  fragment: GraphQLTaggedNode,
  key: TKey,
): $Call<<TData>(?{+$data?: TData, ...}) => ?TData, TKey>;

// if the key is a non-nullable array of keys, return non-nullable array
declare function useFragment<
  TKey: $ReadOnlyArray<{
    +$data?: mixed,
    +$fragmentSpreads: FragmentType,
    ...
  }>,
>(
  fragment: GraphQLTaggedNode,
  key: TKey,
): $Call<<TData>($ReadOnlyArray<{+$data?: TData, ...}>) => TData, TKey>;

// if the key is a nullable array of keys, return nullable array
declare function useFragment<
  TKey: ?$ReadOnlyArray<{
    +$data?: mixed,
    +$fragmentSpreads: FragmentType,
    ...
  }>,
>(
  fragment: GraphQLTaggedNode,
  key: TKey,
): $Call<<TData>(?$ReadOnlyArray<{+$data?: TData, ...}>) => ?TData, TKey>;

function useFragment(fragment: GraphQLTaggedNode, key: mixed): mixed {
  // We need to use this hook in order to be able to track if
  // loadQuery was called during render
  useTrackLoadQueryInRender();

  const fragmentNode = getFragment(fragment);
  useStaticFragmentNodeWarning(fragmentNode, 'first argument of useFragment()');
  const {data} = useFragmentNode<_>(fragmentNode, key, 'useFragment()');
  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDebugValue({fragment: fragmentNode.name, data});
  }
  return data;
}

module.exports = useFragment;
