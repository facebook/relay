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

const RelayCore = require('../store/RelayCore');

const {getDataIDsFromFragment, getVariablesFromFragment} = RelayCore;

const {getFragmentOwner} = require('../store/RelayModernFragmentOwner');

const stableCopy = require('./stableCopy');

import type {ReaderFragment} from '../util/ReaderNode';

function getFragmentIdentifier(
  fragmentNode: ReaderFragment,
  fragmentRef: mixed,
): string {
  const fragmentOwner = getFragmentOwner(
    fragmentNode,
    // $FlowFixMe - TODO T39154660 Use FragmentPointer type instead of mixed
    fragmentRef,
  );
  const fragmentVariables = getVariablesFromFragment(
    // We get the variables from the fragment owner in the fragment ref, so we
    // don't pass them here. This API can change once fragment ownership
    // stops being optional
    // TODO(T39494051)
    {},
    fragmentNode,
    fragmentRef,
    fragmentOwner,
  );
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
