/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<43b13f5aef8ec260298db45e815af5c5>>
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
  "name": "UserReadsClientEdgeResolver$normalization",
  "selections": [
    {
      "kind": "ClientEdgeToServerObject",
      "operation": require('./ClientEdgeQuery_UserReadsClientEdgeResolver_client_edge.graphql'),
      "backingField": {
        "name": "client_edge",
        "args": null,
        "kind": "RelayResolver",
        "storageKey": null,
        "isOutputType": false,
        "resolverInfo": {
          "resolverFunction": require('../UserClientEdgeResolver').client_edge,
          "rootFragment": require('./UserClientEdgeResolver$normalization.graphql')
        }
      },
      "linkedField": {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "client_edge",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    }
  ]
};

if (__DEV__) {
  (node/*:: as any*/).hash = "e516986653910442a460b9755999c3e5";
}

module.exports = node;
