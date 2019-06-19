/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const invariant = require('invariant');

const {getInlineDataFragment, FRAGMENTS_KEY} = require('relay-runtime');

import type {$FragmentRef} from './ReactRelayTypes';
import type {FragmentReference, GraphQLTaggedNode} from 'relay-runtime';

// prettier-ignore
type $InlineFragmentRef<T2> = $Call<
  & (<TRef: FragmentReference, T: {+$refType: TRef}>(                 T ) =>                  $FragmentRef<T> )
  & (<TRef: FragmentReference, T: {+$refType: TRef}>(?                T ) => ?                $FragmentRef<T> )
  & (<TRef: FragmentReference, T: {+$refType: TRef}>( $ReadOnlyArray< T>) =>  $ReadOnlyArray< $FragmentRef<T>>)
  & (<TRef: FragmentReference, T: {+$refType: TRef}>(?$ReadOnlyArray< T>) => ?$ReadOnlyArray< $FragmentRef<T>>)
  & (<TRef: FragmentReference, T: {+$refType: TRef}>( $ReadOnlyArray<?T>) =>  $ReadOnlyArray<?$FragmentRef<T>>)
  & (<TRef: FragmentReference, T: {+$refType: TRef}>(?$ReadOnlyArray<?T>) => ?$ReadOnlyArray<?$FragmentRef<T>>),
  T2
>;

/**
 * Reads an @inline data fragment that was spread into the parent fragment.
 */
function readInlineData<TFragmentData: ?{+$refType: FragmentReference}>(
  fragment: GraphQLTaggedNode,
  fragmentRef: $InlineFragmentRef<TFragmentData>,
): TFragmentData {
  const inlineDataFragment = getInlineDataFragment(fragment);
  if (fragmentRef == null) {
    return fragmentRef;
  }
  invariant(
    typeof fragmentRef === 'object',
    'readInlineData(): Expected an object, got `%s`.',
    typeof fragmentRef,
  );
  // $FlowFixMe
  const inlineData = fragmentRef[FRAGMENTS_KEY]?.[inlineDataFragment.name];
  invariant(
    inlineData != null,
    'readInlineData(): Expected fragment `%s` to be spread in the parent ' +
      'fragment.',
    inlineDataFragment.name,
  );
  return inlineData;
}

module.exports = readInlineData;
