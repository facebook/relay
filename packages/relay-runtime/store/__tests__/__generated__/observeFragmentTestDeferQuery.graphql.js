/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<66c029324b588173abdac1fe2923f24a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { observeFragmentTestDeferFragment$fragmentType } from "./observeFragmentTestDeferFragment.graphql";
export type observeFragmentTestDeferQuery$variables = {||};
export type observeFragmentTestDeferQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: observeFragmentTestDeferFragment$fragmentType,
  |},
|};
export type observeFragmentTestDeferQuery = {|
  response: observeFragmentTestDeferQuery$data,
  variables: observeFragmentTestDeferQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "observeFragmentTestDeferQuery",
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
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "observeFragmentTestDeferFragment"
              }
            ]
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "observeFragmentTestDeferQuery",
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
            "if": null,
            "kind": "Defer",
            "label": "observeFragmentTestDeferQuery$defer$observeFragmentTestDeferFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              }
            ]
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
    ]
  },
  "params": {
    "cacheID": "bb92e381f71946fab972eda47a4ad001",
    "id": null,
    "metadata": {},
    "name": "observeFragmentTestDeferQuery",
    "operationKind": "query",
    "text": "query observeFragmentTestDeferQuery {\n  me {\n    ...observeFragmentTestDeferFragment @defer(label: \"observeFragmentTestDeferQuery$defer$observeFragmentTestDeferFragment\")\n    id\n  }\n}\n\nfragment observeFragmentTestDeferFragment on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "5a5319b06e1f6d93282fd65726091ab2";
}

module.exports = ((node/*: any*/)/*: Query<
  observeFragmentTestDeferQuery$variables,
  observeFragmentTestDeferQuery$data,
>*/);
