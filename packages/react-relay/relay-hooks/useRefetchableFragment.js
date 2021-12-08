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

import type {RefetchFnDynamic} from './useRefetchableFragmentNode';
import type {
  FragmentType,
  GraphQLTaggedNode,
  OperationType,
} from 'relay-runtime';

const useRefetchableFragmentNode = require('./useRefetchableFragmentNode');
const useStaticFragmentNodeWarning = require('./useStaticFragmentNodeWarning');
const {useDebugValue} = require('react');
const {getFragment} = require('relay-runtime');

type ReturnType<TQuery: OperationType, TKey: ?{+$data?: mixed, ...}> = [
  // NOTE: This $Call ensures that the type of the returned data is either:
  //   - nullable if the provided ref type is nullable
  //   - non-nullable if the provided ref type is non-nullable
  // prettier-ignore
  $Call<
    & (<TFragmentData>( { +$data?: TFragmentData, ... }) =>  TFragmentData)
    & (<TFragmentData>(?{ +$data?: TFragmentData, ... }) => ?TFragmentData),
    TKey,
  >,
  RefetchFnDynamic<TQuery, TKey>,
];

function useRefetchableFragment<
  TQuery: OperationType,
  TKey: ?{+$data?: mixed, +$fragmentSpreads: FragmentType, ...},
>(
  fragmentInput: GraphQLTaggedNode,
  fragmentRef: TKey,
): ReturnType<TQuery, TKey> {
  const fragmentNode = getFragment(fragmentInput);
  useStaticFragmentNodeWarning(
    fragmentNode,
    'first argument of useRefetchableFragment()',
  );
  const {fragmentData, refetch} = useRefetchableFragmentNode<TQuery, TKey>(
    fragmentNode,
    fragmentRef,
    'useRefetchableFragment()',
  );
  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDebugValue({fragment: fragmentNode.name, data: fragmentData});
  }
  /* $FlowExpectedError[prop-missing] : Exposed options is a subset of internal
   * options */
  return [fragmentData, (refetch: RefetchFnDynamic<TQuery, TKey>)];
}

module.exports = useRefetchableFragment;
