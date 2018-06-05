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

const invariant = require('invariant');

import type {GeneratedNodeMap} from './ReactRelayTypes';
import type {GraphQLTaggedNode} from 'RelayRuntime';

/**
 * Fail fast if the user supplies invalid fragments as input.
 */
function assertFragmentMap(
  componentName: string,
  fragments: GraphQLTaggedNode | GeneratedNodeMap,
): void {
  invariant(
    fragments && typeof fragments === 'object',
    'Could not create Relay Container for `%s`. ' +
      'Expected a set of GraphQL fragments, got `%s` instead.',
    componentName,
    fragments,
  );

  for (const key in fragments) {
    if (fragments.hasOwnProperty(key)) {
      const fragment = fragments[key];
      invariant(
        fragment &&
          (typeof fragment === 'object' || typeof fragment === 'function'),
        'Could not create Relay Container for `%s`. ' +
          'The value of fragment `%s` was expected to be a fragment, got `%s` instead.',
        componentName,
        key,
        fragment,
      );
    }
  }
}

module.exports = assertFragmentMap;
