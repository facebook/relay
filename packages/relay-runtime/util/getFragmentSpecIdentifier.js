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
const mapObject = require('mapObject');
const stableCopy = require('./stableCopy');

import type {ReaderFragment} from '../util/ReaderNode';

function getFragmentSpecIdentifier(
  fragmentNodes: {[string]: ReaderFragment},
  fragmentRefs: {[string]: mixed},
): string {
  return JSON.stringify(
    stableCopy(
      mapObject(fragmentNodes, (fragmentNode, key) => {
        const fragmentRef = fragmentRefs[key];
        return getFragmentIdentifier(fragmentNode, fragmentRef);
      }),
    ),
  );
}

module.exports = getFragmentSpecIdentifier;
