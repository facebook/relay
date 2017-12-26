/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import type RelayQuery from '../query/RelayQuery';

/**
 * @internal
 *
 * Determine if the given fragment's type is compatible with the given record
 * type. The types are considered compatible if they exactly match or in the
 * following cases:
 * - Types are not recorded for optimistic records; if the record type is null
 *   it is assumed to be compatible with the fragment.
 * - Abstract fragments are assumed to be compatible with all types; being more
 *   precise would require access to the full schema inheritance hierarchy.
 */
function isCompatibleRelayFragmentType(
  fragment: RelayQuery.Fragment,
  recordType: ?string,
): boolean {
  return (
    recordType === fragment.getType() || !recordType || fragment.isAbstract()
  );
}

module.exports = isCompatibleRelayFragmentType;
