/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<eb980180d08cb001991d1002c47b407e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { observeQueryTestToPromiseFragment$fragmentType } from "./observeQueryTestToPromiseFragment.graphql";
export type observeQueryTestToPromiseChainQuery$variables = {||};
export type observeQueryTestToPromiseChainQuery$data = {|
  +me: {|
    +$fragmentSpreads: observeQueryTestToPromiseFragment$fragmentType,
  |},
|};
export type observeQueryTestToPromiseChainQuery = {|
  response: observeQueryTestToPromiseChainQuery$data,
  variables: observeQueryTestToPromiseChainQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "observeQueryTestToPromiseChainQuery",
    "selections": [
      {
        "kind": "RequiredField",
        "field": {
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
              "name": "observeQueryTestToPromiseFragment"
            }
          ],
          "storageKey": null
        },
        "action": "THROW"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "observeQueryTestToPromiseChainQuery",
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
      }
    ]
  },
  "params": {
    "cacheID": "10a4ce6c650ba3747f231ed24cb8311c",
    "id": null,
    "metadata": {},
    "name": "observeQueryTestToPromiseChainQuery",
    "operationKind": "query",
    "text": "query observeQueryTestToPromiseChainQuery {\n  me {\n    ...observeQueryTestToPromiseFragment\n    id\n  }\n}\n\nfragment observeQueryTestToPromiseFragment on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "d090c63a0d3e49ee45ef4907368db51e";
}

module.exports = ((node/*: any*/)/*: Query<
  observeQueryTestToPromiseChainQuery$variables,
  observeQueryTestToPromiseChainQuery$data,
>*/);
