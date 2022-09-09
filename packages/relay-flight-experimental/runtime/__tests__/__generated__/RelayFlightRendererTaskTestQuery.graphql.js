/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<687f151f4695c469105ac4217a5ab4bb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayFlightRendererTaskTestFragment$fragmentType } from "./RelayFlightRendererTaskTestFragment.graphql";
export type RelayFlightRendererTaskTestQuery$variables = {|
  id: string,
|};
export type RelayFlightRendererTaskTestQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayFlightRendererTaskTestFragment$fragmentType,
  |},
|};
export type RelayFlightRendererTaskTestQuery = {|
  response: RelayFlightRendererTaskTestQuery$data,
  variables: RelayFlightRendererTaskTestQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayFlightRendererTaskTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayFlightRendererTaskTestFragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayFlightRendererTaskTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
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
    "cacheID": "cdd7f18850e2c613a80b987dcc1f2ef3",
    "id": null,
    "metadata": {},
    "name": "RelayFlightRendererTaskTestQuery",
    "operationKind": "query",
    "text": "query RelayFlightRendererTaskTestQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayFlightRendererTaskTestFragment\n    id\n  }\n}\n\nfragment RelayFlightRendererTaskTestFragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5d0acc589a993b333c9e5085f6804c21";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayFlightRendererTaskTestQuery$variables,
  RelayFlightRendererTaskTestQuery$data,
>*/);
