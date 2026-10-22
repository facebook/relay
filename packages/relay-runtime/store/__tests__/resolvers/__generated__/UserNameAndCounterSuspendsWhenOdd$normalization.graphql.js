/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f05be5bb4e48cd469fd429e8d916710c>>
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
  "name": "UserNameAndCounterSuspendsWhenOdd$normalization",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "me",
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
    },
    {
      "name": "counter_suspends_when_odd",
      "args": null,
      "kind": "RelayLiveResolver",
      "storageKey": null,
      "isOutputType": true,
      "resolverInfo": {
        "resolverFunction": require('../CounterSuspendsWhenOdd').counter_suspends_when_odd,
        "rootFragment": require('./CounterSuspendsWhenOdd$normalization.graphql')
      }
    }
  ]
};

if (__DEV__) {
  (node/*:: as any*/).hash = "1a64e6e5a1ce87aa12f684231ab0da09";
}

module.exports = node;
