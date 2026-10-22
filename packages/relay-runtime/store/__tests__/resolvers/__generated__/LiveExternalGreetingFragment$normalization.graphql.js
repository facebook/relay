/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c6b1305849daf2ec273481a21de66318>>
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
  "name": "LiveExternalGreetingFragment$normalization",
  "selections": [
    {
      "kind": "ClientEdgeToServerObject",
      "operation": require('./ClientEdgeQuery_LiveExternalGreetingFragment_user.graphql'),
      "backingField": {
        "name": "live_user_suspends_when_odd",
        "args": null,
        "kind": "RelayLiveResolver",
        "storageKey": null,
        "isOutputType": false,
        "resolverInfo": {
          "resolverFunction": require('../LiveUserSuspendsWhenOdd').live_user_suspends_when_odd,
          "rootFragment": null
        }
      },
      "linkedField": {
        "alias": "user",
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "live_user_suspends_when_odd",
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
  (node/*:: as any*/).hash = "d99958d995a71b9db58b73932515179f";
}

module.exports = node;
