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

import type {ReturnType} from '../useRefetchableFragment';
import type {FragmentType, RefetchableFragment, Variables} from 'relay-runtime';

const useStaticFragmentNodeWarning = require('../useStaticFragmentNodeWarning');
const useRefetchableFragmentInternal = require('./useRefetchableFragmentInternal_EXPERIMENTAL');
const {useDebugValue} = require('react');
const {getFragment} = require('relay-runtime');

function useRefetchableFragment<
  TFragmentType: FragmentType,
  TVariables: Variables,
  TData,
  TKey: ?{+$fragmentSpreads: TFragmentType, ...},
>(
  fragmentInput: RefetchableFragment<TFragmentType, TData, TVariables>,
  fragmentRef: TKey,
): ReturnType<TVariables, TData, TKey> {
  const fragmentNode = getFragment(fragmentInput);
  useStaticFragmentNodeWarning(
    fragmentNode,
    'first argument of useRefetchableFragment()',
  );
  const {fragmentData, refetch} = useRefetchableFragmentInternal<
    {variables: TVariables, response: TData},
    {data?: TData},
  >(fragmentNode, fragmentRef, 'useRefetchableFragment()');
  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDebugValue({fragment: fragmentNode.name, data: fragmentData});
  }
  // $FlowFixMe[incompatible-return]
  // $FlowFixMe[prop-missing]
  return [fragmentData, refetch];
}

module.exports = useRefetchableFragment;
