/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<70fac82ef4be2ceaeb7ffb75e94b56aa>>
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
  "name": "ClientEdgeToClientObjectTestClientRootNameFragment$normalization",
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
            "resolverFunction": require('../ClientEdgeToClientObject-test').self,
            "rootFragment": require('./ClientEdgeToClientObjectTestClientRootFragment$normalization.graphql')
          }
        }
      ]
    }
  ]
};

if (__DEV__) {
  (node/*:: as any*/).hash = "22c8af82f4599e2fe1b29ccf8da33b51";
}

module.exports = node;
