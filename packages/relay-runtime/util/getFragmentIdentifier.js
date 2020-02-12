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

// flowlint ambiguous-object-type:error

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
  const fragmentOwnerIdentifier =
    selector == null
      ? 'null'
      : selector.kind === 'SingularReaderSelector'
      ? selector.owner.identifier
      : '[' +
        selector.selectors.map(sel => sel.owner.identifier).join(',') +
        ']';
  const fragmentVariables = getVariablesFromFragment(fragmentNode, fragmentRef);
  const dataIDs = getDataIDsFromFragment(fragmentNode, fragmentRef);
  return (
    fragmentOwnerIdentifier +
    '/' +
    fragmentNode.name +
    '/' +
    JSON.stringify(stableCopy(fragmentVariables)) +
    '/' +
    (JSON.stringify(dataIDs) ?? 'missing')
  );
}

module.exports = getFragmentIdentifier;
