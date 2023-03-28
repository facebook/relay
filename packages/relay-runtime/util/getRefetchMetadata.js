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

import type {
  ReaderFragment,
  ReaderRefetchMetadata,
  RefetchableIdentifierInfo,
} from './ReaderNode';
import type {ConcreteRequest} from './RelayConcreteNode';

const invariant = require('invariant');

function getRefetchMetadata(
  fragmentNode: ReaderFragment,
  componentDisplayName: string,
): {
  fragmentRefPathInResponse: $ReadOnlyArray<string | number>,
  identifierInfo: ?RefetchableIdentifierInfo,
  refetchableRequest: ConcreteRequest,
  refetchMetadata: ReaderRefetchMetadata,
} {
  invariant(
    fragmentNode.metadata?.plural !== true,
    'Relay: getRefetchMetadata(): Expected fragment `%s` not to be plural when using ' +
      '`%s`. Remove `@relay(plural: true)` from fragment `%s` ' +
      'in order to use it with `%s`.',
    fragmentNode.name,
    componentDisplayName,
    fragmentNode.name,
    componentDisplayName,
  );

  const refetchMetadata = fragmentNode.metadata?.refetch;
  invariant(
    refetchMetadata != null,
    'Relay: getRefetchMetadata(): Expected fragment `%s` to be refetchable when using `%s`. ' +
      'Did you forget to add a @refetchable directive to the fragment?',
    componentDisplayName,
    fragmentNode.name,
  );

  // handle both commonjs and es modules
  const refetchableRequest: ConcreteRequest | string =
    (refetchMetadata: $FlowFixMe).operation.default
      ? (refetchMetadata: $FlowFixMe).operation.default
      : refetchMetadata.operation;
  const fragmentRefPathInResponse = refetchMetadata.fragmentPathInResult;
  invariant(
    typeof refetchableRequest !== 'string',
    'Relay: getRefetchMetadata(): Expected refetch query to be an ' +
      "operation and not a string when using `%s`. If you're seeing this, " +
      'this is likely a bug in Relay.',
    componentDisplayName,
  );
  const identifierInfo = refetchMetadata.identifierInfo;
  if (identifierInfo != null) {
    invariant(
      identifierInfo.identifierField == null ||
        typeof identifierInfo.identifierField === 'string',
      'Relay: getRefetchMetadata(): Expected `identifierField` to be a string.',
    );
    invariant(
      identifierInfo.identifierQueryVariableName == null ||
        typeof identifierInfo.identifierQueryVariableName === 'string',
      'Relay: getRefetchMetadata(): Expected `identifierQueryVariableName` to be a string.',
    );
  }
  return {
    fragmentRefPathInResponse,
    identifierInfo,
    refetchableRequest,
    refetchMetadata,
  };
}

module.exports = getRefetchMetadata;
