/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d303319c6bb0949c830ac5570fac55d8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge$fragmentType } from "./RefetchableClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge.graphql";
export type ClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge$variables = {|
  id: string,
|};
export type ClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge$fragmentType,
  |},
|};
export type ClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge = {|
  response: ClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge$data,
  variables: ClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge$variables,
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
    "name": "ClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge",
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
            "name": "RefetchableClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge"
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
    "name": "ClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge",
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
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "f30d82786d7fca44b35ae41ba06b7bf1",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge on User {\n  name\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "145cd045d842ac7fe259d9f5210a67c1";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge$variables,
  ClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge$data,
>*/);
