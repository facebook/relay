/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7cb6d9e0cf5fe2439e553d2430dbc794>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { observeFragmentTestClientEdgeToServerFragment$fragmentType } from "./observeFragmentTestClientEdgeToServerFragment.graphql";
export type observeFragmentTestClientEdgeToServerQuery$variables = {||};
export type observeFragmentTestClientEdgeToServerQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: observeFragmentTestClientEdgeToServerFragment$fragmentType,
  |},
|};
export type observeFragmentTestClientEdgeToServerQuery = {|
  response: observeFragmentTestClientEdgeToServerQuery$data,
  variables: observeFragmentTestClientEdgeToServerQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "observeFragmentTestClientEdgeToServerQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "observeFragmentTestClientEdgeToServerFragment"
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
    "name": "observeFragmentTestClientEdgeToServerQuery",
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
            "name": "client_edge",
            "args": null,
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                }
              ],
              "type": "User",
              "abstractKey": null
            },
            "kind": "RelayResolver",
            "storageKey": null,
            "isOutputType": false
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
    "cacheID": "f92b28518749f951c278d5d7b8208d33",
    "id": null,
    "metadata": {},
    "name": "observeFragmentTestClientEdgeToServerQuery",
    "operationKind": "query",
    "text": "query observeFragmentTestClientEdgeToServerQuery {\n  me {\n    ...observeFragmentTestClientEdgeToServerFragment\n    id\n  }\n}\n\nfragment UserClientEdgeResolver on User {\n  name\n}\n\nfragment observeFragmentTestClientEdgeToServerFragment on User {\n  ...UserClientEdgeResolver\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "838cbe3731d20b114e23d080d0e9482e";
}

module.exports = ((node/*: any*/)/*: Query<
  observeFragmentTestClientEdgeToServerQuery$variables,
  observeFragmentTestClientEdgeToServerQuery$data,
>*/);
