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

const invariant = require('invariant');

const {FRAGMENT_OWNER_KEY} = require('./RelayStoreUtils');

import type {ReaderFragment} from '../util/ReaderNode';
import type {RequestDescriptor, FragmentPointer} from './RelayStoreTypes';

function getSingularFragmentOwner(
  fragmentNode: ReaderFragment,
  fragmentRef: ?FragmentPointer,
): ?RequestDescriptor {
  if (fragmentRef == null) {
    return null;
  }
  invariant(
    typeof fragmentRef === 'object',
    'RelayModernFragmentOwner: Expected value for fragment `%s` to be an object, got ' +
      '`%s`.',
    fragmentNode.name,
    typeof fragmentRef,
  );
  const owner = fragmentRef[FRAGMENT_OWNER_KEY] ?? null;
  return owner;
}

function getPluralFragmentOwner(
  fragmentNode: ReaderFragment,
  fragmentRef: $ReadOnlyArray<?FragmentPointer>,
): Array<?RequestDescriptor> {
  return fragmentRef.map(ref => getSingularFragmentOwner(fragmentNode, ref));
}

/**
 * @public
 * Extracts the fragment owner associated with the given fragment reference.
 * TODO(T39494051) - This helper function will become unnecessary once we're
 * using fragment ownership by default
 */
function getFragmentOwner(
  fragmentNode: ReaderFragment,
  fragmentRef: ?FragmentPointer | $ReadOnlyArray<?FragmentPointer>,
): ?RequestDescriptor | Array<?RequestDescriptor> {
  if (Array.isArray(fragmentRef)) {
    return getPluralFragmentOwner(fragmentNode, fragmentRef);
  }
  return getSingularFragmentOwner(fragmentNode, fragmentRef);
}

/**
 * @public
 * Given a map of key -> fragment nodes, and a map of key -> fragment refs,
 * extracts and returns a map of key -> associated fragment owner.
 * This is useful to construct the argument required by getSelectorsFromObject
 * TODO(T39494051) - This helper function will become unnecessary once we're
 * using fragment ownership by default
 */
function getFragmentOwners(
  fragmentNodes: {[string]: ReaderFragment},
  fragmentRefs: {[string]: mixed},
): {[string]: ?RequestDescriptor | Array<?RequestDescriptor>} {
  const fragmentOwners = {};
  for (const key in fragmentNodes) {
    fragmentOwners[key] = getFragmentOwner(
      fragmentNodes[key],
      // $FlowFixMe - TODO T39154660 Use FragmentPointer type instead of mixed
      fragmentRefs[key],
    );
  }
  return fragmentOwners;
}

module.exports = {getFragmentOwner, getFragmentOwners};
