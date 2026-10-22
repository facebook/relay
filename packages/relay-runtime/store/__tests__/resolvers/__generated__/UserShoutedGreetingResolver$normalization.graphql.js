/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9c6c6409a2f11d01e6ed71f7017cda23>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

*/

var node/*: NormalizationSplitOperation*/ = {
  "kind": "SplitOperation",
  "metadata": {
    "hasServerField": true
  },
  "name": "UserShoutedGreetingResolver$normalization",
  "selections": [
    {
      "name": "greeting",
      "args": null,
      "kind": "RelayResolver",
      "storageKey": null,
      "isOutputType": true,
      "resolverInfo": {
        "resolverFunction": require('../UserGreetingResolver').greeting,
        "rootFragment": require('./UserGreetingResolver$normalization.graphql')
      }
    }
  ]
};

if (__DEV__) {
  (node/*:: as any*/).hash = "02f95e5e254d019e8c7dfcaaba1c97a0";
}

module.exports = node;
