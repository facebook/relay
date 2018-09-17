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

import type {
  GraphQLTaggedNode,
  IEnvironment,
  Snapshot,
  Variables,
} from 'relay-runtime';

function readFragment_UNSTABLE(
  environment: IEnvironment,
  fragment: GraphQLTaggedNode,
  fragmentRef: mixed,
  variables: Variables,
): Snapshot | $ReadOnlyArray<Snapshot> {
  invariant(
    fragmentRef != null,
    'readFragment_UNSTABLE: Expected fragmentRef to be provided',
  );
  const {
    getFragment,
    getSelector,
    getSelectorList,
  } = environment.unstable_internal;
  const fragmentNode = getFragment(fragment);
  if (fragmentNode.metadata && fragmentNode.metadata.plural === true) {
    invariant(
      Array.isArray(fragmentRef),
      'Expected fragmentRef to be an array if fragment %s is marked as @relay(plural: true)',
      fragmentNode.name,
    );
    const selectors = getSelectorList(variables, fragmentNode, fragmentRef);
    invariant(
      selectors != null,
      'Expected to be able to read fragment %s',
      fragmentNode.name,
    );
    return selectors.map(selector => environment.lookup(selector));
  } else {
    invariant(
      !Array.isArray(fragmentRef),
      'Expected fragmentRef not to be an array if fragment %s is not marked as @relay(plural: true)',
      fragmentNode.name,
    );
    const selector = getSelector(variables, fragmentNode, fragmentRef);
    invariant(
      selector != null,
      'Expected to be able to read fragment %s',
      fragmentNode.name,
    );
    return environment.lookup(selector);
  }
}

module.exports = readFragment_UNSTABLE;
