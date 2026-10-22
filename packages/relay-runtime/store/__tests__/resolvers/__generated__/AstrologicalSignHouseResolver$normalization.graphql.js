/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2d9e54d87f4df8bbd84c20d7a72fd03f>>
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
  "name": "AstrologicalSignHouseResolver$normalization",
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
  (node/*:: as any*/).hash = "96406c4a0fd65a85140fef0d15d7412f";
}

module.exports = node;
