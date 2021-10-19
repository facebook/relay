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

import type {ReaderFragment} from './ReaderNode';

const {
  getDataIDsFromFragment,
  getSelector,
  getVariablesFromFragment,
} = require('../store/RelayModernSelector');
const isEmptyObject = require('./isEmptyObject');
const RelayFeatureFlags = require('./RelayFeatureFlags');
const stableCopy = require('./stableCopy');
const {intern} = require('./StringInterner');

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

  if (RelayFeatureFlags.ENABLE_GETFRAGMENTIDENTIFIER_OPTIMIZATION) {
    let ids =
      typeof dataIDs === 'undefined'
        ? 'missing'
        : dataIDs == null
        ? 'null'
        : Array.isArray(dataIDs)
        ? '[' + dataIDs.join(',') + ']'
        : dataIDs;
    ids =
      RelayFeatureFlags.STRING_INTERN_LEVEL <= 1
        ? ids
        : intern(ids, RelayFeatureFlags.MAX_DATA_ID_LENGTH);

    return (
      fragmentOwnerIdentifier +
      '/' +
      fragmentNode.name +
      '/' +
      (fragmentVariables == null || isEmptyObject(fragmentVariables)
        ? '{}'
        : JSON.stringify(stableCopy(fragmentVariables))) +
      '/' +
      ids
    );
  } else {
    let ids = JSON.stringify(dataIDs) ?? 'missing';
    ids =
      RelayFeatureFlags.STRING_INTERN_LEVEL <= 1
        ? ids
        : intern(ids, RelayFeatureFlags.MAX_DATA_ID_LENGTH);

    return (
      fragmentOwnerIdentifier +
      '/' +
      fragmentNode.name +
      '/' +
      JSON.stringify(stableCopy(fragmentVariables)) +
      '/' +
      ids
    );
  }
}

module.exports = getFragmentIdentifier;
