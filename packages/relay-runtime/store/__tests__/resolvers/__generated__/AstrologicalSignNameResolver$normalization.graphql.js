/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c8f3f3b61e22f350955c51c0430bcf49>>
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
  "metadata": {},
  "name": "AstrologicalSignNameResolver$normalization",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "name": "self",
          "args": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": true,
          "resolverInfo": {
            "resolverFunction": require('../AstrologicalSignSelfResolver').self,
            "rootFragment": require('./AstrologicalSignSelfResolver$normalization.graphql')
          }
        }
      ]
    }
  ]
};

if (__DEV__) {
  (node/*:: as any*/).hash = "9ad858ddaec8b65cd26583a45087ea88";
}

module.exports = node;
