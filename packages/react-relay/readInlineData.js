/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');

const {getInlineDataFragment, FRAGMENTS_KEY} = require('relay-runtime');

import type {FragmentReference, GraphQLTaggedNode} from 'relay-runtime';

/**
 * Reads an @inline data fragment that was spread into the parent fragment.
 */

declare function readInlineData<
  TRef: FragmentReference,
  TData,
  TKey: {+$data?: TData, +$fragmentRefs: TRef},
>(
  fragment: GraphQLTaggedNode,
  fragmentRef: TKey,
): TData;
declare function readInlineData<
  TRef: FragmentReference,
  TData,
  TKey: ?{+$data?: TData, +$fragmentRefs: TRef},
>(
  fragment: GraphQLTaggedNode,
  fragmentRef: null | void,
): ?TData;
function readInlineData(
  fragment: GraphQLTaggedNode,
  fragmentRef: mixed,
): mixed {
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
