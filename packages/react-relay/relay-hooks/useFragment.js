/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
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

import type {Fragment, FragmentType, GraphQLTaggedNode} from 'relay-runtime';

const HooksImplementation = require('./HooksImplementation');
const {useTrackLoadQueryInRender} = require('./loadQuery');
const useFragmentNode = require('./useFragmentNode');
const useStaticFragmentNodeWarning = require('./useStaticFragmentNodeWarning');
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

function useFragment_LEGACY(fragment: GraphQLTaggedNode, key: mixed): mixed {
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

function useFragment(fragment: GraphQLTaggedNode, key: mixed): mixed {
  const impl = HooksImplementation.get();
  if (impl) {
    // $FlowFixMe This is safe because impl.useFragment has the type of useFragment...
    return impl.useFragment(fragment, key);
    // (i.e. type declared above, but not the supertype used in this function definition)
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useFragment_LEGACY(fragment, key);
  }
}

module.exports = useFragment;
