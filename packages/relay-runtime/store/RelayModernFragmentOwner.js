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

import type {FragmentOwner, OperationSelector} from './RelayStoreTypes';

/**
 * Creates an instance of a FragmentOwner based on an OperationSelector.
 * FragmentOwners are attached to an OwnedReaderSelector and passed down
 * to fragment containers via FragmentPointers
 *
 * TODO(T39154899) - FragmentOwner is a subset of OperationSelector,
 * but we could consider making it a full OperationSelector in the future.
 */
function createFragmentOwner(operation: OperationSelector): FragmentOwner {
  return {
    request: operation.node,
    variables: operation.variables,
  };
}

module.exports = {
  createFragmentOwner,
};
