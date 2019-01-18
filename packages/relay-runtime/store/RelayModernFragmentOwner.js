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

import type {FragmentOwner, OperationDescriptor} from './RelayStoreTypes';

/**
 * Creates an instance of a FragmentOwner based on an OperationDescriptor.
 * FragmentOwners are attached to an OwnedReaderSelector and passed down
 * to fragment containers via FragmentPointers
 *
 * TODO(T39154899) - FragmentOwner is a subset of OperationDescriptor,
 * but we could consider making it a full OperationDescriptor in the future.
 */
function createFragmentOwner(operation: OperationDescriptor): FragmentOwner {
  return {
    request: operation.node,
    variables: operation.variables,
  };
}

module.exports = {
  createFragmentOwner,
};
