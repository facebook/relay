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

const {
  getDataIDsFromFragment,
  getVariablesFromFragment,
  getSelector,
} = require('../store/RelayModernSelector');

import type {ReaderFragment} from './ReaderNode';

function getFragmentIdentifier(
  fragmentNode: ReaderFragment,
  fragmentRef: mixed,
): string {
  const selector = getSelector(fragmentNode, fragmentRef);
  const fragmentVariables = getVariablesFromFragment(fragmentNode, fragmentRef);
  const dataIDs = getDataIDsFromFragment(fragmentNode, fragmentRef);

  let fragmentOwnerID;
  let fragmentOwnerVariables;

  if (selector == null) {
    fragmentOwnerID = null;
    fragmentOwnerVariables = null;
  } else if (selector.kind === 'PluralReaderSelector') {
    fragmentOwnerID = selector.selectors.map(
      sel => sel.owner.node.params.id ?? sel.owner.node.params.name ?? '',
    );
    fragmentOwnerVariables = selector.selectors.map(
      sel => sel.owner.variables ?? null,
    );
  } else {
    fragmentOwnerID =
      selector.owner.node.params.id ?? selector?.owner.node.params.name ?? '';
    fragmentOwnerVariables = selector.owner.variables ?? null;
  }

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
