/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {Fragment, FragmentType, GraphQLTaggedNode} from 'relay-runtime';

const {useTrackLoadQueryInRender} = require('../loadQuery');
const useStaticFragmentNodeWarning = require('../useStaticFragmentNodeWarning');
const useFragmentInternal = require('./useFragmentInternal_EXPERIMENTAL');
const {useDebugValue} = require('react');
const {getFragment} = require('relay-runtime');

type HasSpread<TFragmentType> = {
  +$fragmentSpreads: TFragmentType,
  ...
};

// if the key is non-nullable, return non-nullable value
declare function useFragment<TFragmentType: FragmentType, TData>(
  fragment: Fragment<TFragmentType, TData>,
  key: HasSpread<TFragmentType>,
): TData;

// if the key is a non-nullable array of keys, return non-nullable array
declare function useFragment<TFragmentType: FragmentType, TData>(
  fragment: Fragment<TFragmentType, TData>,
  key: $ReadOnlyArray<HasSpread<TFragmentType>>,
): TData;

// if the key is null/void, return null/void value
declare function useFragment<TFragmentType: FragmentType, TData>(
  fragment: Fragment<TFragmentType, TData>,
  key: null | void,
): null | void;

function useFragment(fragment: GraphQLTaggedNode, key: mixed): mixed {
  // We need to use this hook in order to be able to track if
  // loadQuery was called during render
  useTrackLoadQueryInRender();

  const fragmentNode = getFragment(fragment);
  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useStaticFragmentNodeWarning(
      fragmentNode,
      'first argument of useFragment()',
    );
  }
  const data = useFragmentInternal(fragmentNode, key, 'useFragment()');
  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDebugValue({fragment: fragmentNode.name, data});
  }
  return data;
}

module.exports = useFragment;
