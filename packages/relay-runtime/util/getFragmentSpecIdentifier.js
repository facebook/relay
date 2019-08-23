/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

'use strict';

const getFragmentIdentifier = require('./getFragmentIdentifier');

import type {ReaderFragment} from '../util/ReaderNode';

function getFragmentSpecIdentifier(
  fragmentNodes: {[string]: ReaderFragment},
  fragmentRefs: {[string]: mixed},
): string {
  return Object.keys(fragmentNodes)
    .sort()
    .map(
      key =>
        key +
        ':' +
        getFragmentIdentifier(fragmentNodes[key], fragmentRefs[key]),
    )
    .join(',');
}

module.exports = getFragmentSpecIdentifier;
