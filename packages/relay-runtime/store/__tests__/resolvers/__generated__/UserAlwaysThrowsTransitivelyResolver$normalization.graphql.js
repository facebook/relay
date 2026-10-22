/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7da3ffdca1a1d7fccf37bcd0671a17f5>>
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
  "name": "UserAlwaysThrowsTransitivelyResolver$normalization",
  "selections": [
    {
      "name": "always_throws",
      "args": null,
      "kind": "RelayResolver",
      "storageKey": null,
      "isOutputType": true,
      "resolverInfo": {
        "resolverFunction": require('../UserAlwaysThrowsResolver').always_throws,
        "rootFragment": require('./UserAlwaysThrowsResolver$normalization.graphql')
      }
    }
  ]
};

if (__DEV__) {
  (node/*:: as any*/).hash = "46889babda2ee3ea422d710cb059c7e7";
}

module.exports = node;
