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

import type {FragmentType, GraphQLTaggedNode} from 'relay-runtime';

const useIsOperationNodeActive = require('./useIsOperationNodeActive');
const useStaticFragmentNodeWarning = require('./useStaticFragmentNodeWarning');
const {getFragment} = require('relay-runtime');

function useIsParentQueryActive<
  TKey: ?{+$data?: mixed, +$fragmentSpreads: FragmentType, ...},
>(fragmentInput: GraphQLTaggedNode, fragmentRef: TKey): boolean {
  const fragmentNode = getFragment(fragmentInput);
  useStaticFragmentNodeWarning(
    fragmentNode,
    'first argument of useIsParentQueryActive()',
  );
  return useIsOperationNodeActive(fragmentNode, fragmentRef);
}

module.exports = useIsParentQueryActive;
