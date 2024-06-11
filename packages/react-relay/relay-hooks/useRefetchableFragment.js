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

import type {Options} from './legacy/useRefetchableFragmentNode';
import type {
  Disposable,
  FragmentType,
  RefetchableFragment,
  Variables,
} from 'relay-runtime';

const HooksImplementation = require('./HooksImplementation');
const useRefetchableFragmentNode = require('./legacy/useRefetchableFragmentNode');
const useStaticFragmentNodeWarning = require('./useStaticFragmentNodeWarning');
const {useDebugValue} = require('react');
const {getFragment} = require('relay-runtime');

type RefetchVariables<TVariables, TKey: ?{+$fragmentSpreads: mixed, ...}> =
  // NOTE: This type ensures that the type of the returned variables is either:
  //   - nullable if the provided ref type is nullable
  //   - non-nullable if the provided ref type is non-nullable
  [+key: TKey] extends [+key: {+$fragmentSpreads: mixed, ...}]
    ? Partial<TVariables>
    : TVariables;

type RefetchFnBase<TVars, TOptions> = (
  vars: TVars,
  options?: TOptions,
) => Disposable;

export type RefetchFn<TVariables, TKey, TOptions = Options> = RefetchFnBase<
  RefetchVariables<TVariables, TKey>,
  TOptions,
>;

export type ReturnType<
  TVariables,
  TData,
  TKey: ?{+$fragmentSpreads: mixed, ...},
> = [
  // NOTE: This type ensures that the type of the returned data is either:
  //   - nullable if the provided ref type is nullable
  //   - non-nullable if the provided ref type is non-nullable
  [+key: TKey] extends [+key: {+$fragmentSpreads: mixed, ...}] ? TData : ?TData,
  RefetchFn<TVariables, TKey>,
];

export type UseRefetchableFragmentType = <
  TFragmentType: FragmentType,
  TVariables: Variables,
  TData,
  TKey: ?{+$fragmentSpreads: TFragmentType, ...},
>(
  fragment: RefetchableFragment<TFragmentType, TData, TVariables>,
  key: TKey,
) => ReturnType<TVariables, TData, TKey>;

function useRefetchableFragment_LEGACY<
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
  const {fragmentData, refetch} = useRefetchableFragmentNode<
    {
      response: TData,
      variables: TVariables,
    },
    {
      +$data: mixed,
      ...
    },
  >(fragmentNode, fragmentRef, 'useRefetchableFragment()');
  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDebugValue({fragment: fragmentNode.name, data: fragmentData});
  }

  // $FlowFixMe[incompatible-return]
  // $FlowFixMe[prop-missing]
  // $FlowFixMe[incompatible-variance]
  return [fragmentData, refetch];
}

function useRefetchableFragment<
  TFragmentType: FragmentType,
  TVariables: Variables,
  TData,
  TKey: ?{+$fragmentSpreads: TFragmentType, ...},
>(
  fragmentInput: RefetchableFragment<TFragmentType, TData, TVariables>,
  parentFragmentRef: TKey,
): ReturnType<TVariables, TData, TKey> {
  const impl = HooksImplementation.get();
  if (impl) {
    // $FlowExpectedError[incompatible-return] Flow cannot prove that two conditional type satisfy each other
    return impl.useRefetchableFragment<TFragmentType, TVariables, TData, TKey>(
      fragmentInput,
      parentFragmentRef,
    );
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRefetchableFragment_LEGACY(fragmentInput, parentFragmentRef);
  }
}

module.exports = useRefetchableFragment;
