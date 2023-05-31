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

import type {
  ReaderRefetchMetadata,
  RefetchableIdentifierInfo,
} from './ReaderNode';

// TODO(T154006492): Temporary module. identifierInfo is a new structure that replaces the
// string identifierField. This function is needed to support rolling out the
// runtime changes that use the new structure (and types) before we rollout the
// compiler changes that emit the new structure.
function getIdentifierInfo(
  refetchMetadata: ReaderRefetchMetadata,
): ?RefetchableIdentifierInfo {
  if (refetchMetadata.identifierField != null) {
    return {
      identifierField: refetchMetadata.identifierField,
      identifierQueryVariableName: refetchMetadata.identifierField,
    };
  }
  return refetchMetadata.identifierInfo;
}
module.exports = getIdentifierInfo;
