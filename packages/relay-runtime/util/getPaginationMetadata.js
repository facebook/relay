/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {ReaderFragment, ReaderPaginationMetadata} from './ReaderNode';
import type {ConcreteRequest} from './RelayConcreteNode';

const getRefetchMetadata = require('./getRefetchMetadata');
const invariant = require('invariant');

function getPaginationMetadata(
  fragmentNode: ReaderFragment,
  componentDisplayName: string,
): {
  connectionPathInFragmentData: $ReadOnlyArray<string | number>,
  identifierField: ?string,
  paginationRequest: ConcreteRequest,
  paginationMetadata: ReaderPaginationMetadata,
  stream: boolean,
} {
  const {refetchableRequest: paginationRequest, refetchMetadata} =
    getRefetchMetadata(fragmentNode, componentDisplayName);

  const paginationMetadata = refetchMetadata.connection;
  invariant(
    paginationMetadata != null,
    'Relay: getPaginationMetadata(): Expected fragment `%s` to include a ' +
      'connection when using `%s`. Did you forget to add a @connection ' +
      'directive to the connection field in the fragment?',
    componentDisplayName,
    fragmentNode.name,
  );
  const connectionPathInFragmentData = paginationMetadata.path;

  const connectionMetadata = (fragmentNode.metadata?.connection ?? [])[0];
  invariant(
    connectionMetadata != null,
    'Relay: getPaginationMetadata(): Expected fragment `%s` to include a ' +
      'connection when using `%s`. Did you forget to add a @connection ' +
      'directive to the connection field in the fragment?',
    componentDisplayName,
    fragmentNode.name,
  );
  const identifierInfo = refetchMetadata.identifierInfo;
  invariant(
    identifierInfo?.identifierField == null ||
      typeof identifierInfo.identifierField === 'string',
    'Relay: getRefetchMetadata(): Expected `identifierField` to be a string.',
  );
  return {
    connectionPathInFragmentData,
    identifierField: identifierInfo?.identifierField,
    paginationRequest,
    paginationMetadata,
    stream: connectionMetadata.stream === true,
  };
}

module.exports = getPaginationMetadata;
