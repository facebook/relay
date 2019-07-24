/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

'use strict';

const stableCopy = require('./stableCopy');

const {getFragmentOwner} = require('../store/RelayModernFragmentOwner');
const {
  getDataIDsFromFragment,
  getVariablesFromFragment,
} = require('../store/RelayModernSelector');

import type {ReaderFragment} from './ReaderNode';

function getFragmentIdentifier(
  fragmentNode: ReaderFragment,
  fragmentRef: mixed,
): string {
  const fragmentOwner = getFragmentOwner(
    fragmentNode,
    // $FlowFixMe - TODO T39154660 Use FragmentPointer type instead of mixed
    fragmentRef,
  );
  const fragmentVariables = getVariablesFromFragment(fragmentNode, fragmentRef);
  const dataIDs = getDataIDsFromFragment(fragmentNode, fragmentRef);

  const fragmentOwnerID = Array.isArray(fragmentOwner)
    ? fragmentOwner.map(
        owner => owner?.node.params.id ?? owner?.node.params.name ?? '',
      )
    : fragmentOwner?.node.params.id ?? fragmentOwner?.node.params.name ?? '';
  const fragmentOwnerVariables = Array.isArray(fragmentOwner)
    ? fragmentOwner.map(owner => owner?.variables ?? null)
    : fragmentOwner?.variables ?? null;

  return `${fragmentNode.name}-${JSON.stringify(
    stableCopy({
      dataIDs,
      fragmentVariables,
      fragmentOwnerID,
      fragmentOwnerVariables,
    }),
  )}`;
}

module.exports = getFragmentIdentifier;
