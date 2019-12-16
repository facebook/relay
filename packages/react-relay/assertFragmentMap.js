/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const invariant = require('invariant');

import type {GeneratedNodeMap} from './ReactRelayTypes';

/**
 * Fail fast if the user supplies invalid fragments as input.
 */
function assertFragmentMap(
  componentName: string,
  fragmentSpec: GeneratedNodeMap,
): void {
  invariant(
    fragmentSpec && typeof fragmentSpec === 'object',
    'Could not create Relay Container for `%s`. ' +
      'Expected a set of GraphQL fragments, got `%s` instead.',
    componentName,
    fragmentSpec,
  );

  for (const key in fragmentSpec) {
    if (fragmentSpec.hasOwnProperty(key)) {
      const fragment = fragmentSpec[key];
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
