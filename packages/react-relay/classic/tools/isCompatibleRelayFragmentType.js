/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isCompatibleRelayFragmentType
 * @flow
 * @format
 */

'use strict';

import type RelayQuery from 'RelayQuery';

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
