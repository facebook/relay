/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0ed3424f84247a67715ebc24fb1cbb56>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user$fragmentType } from "./RefetchableClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user.graphql";
export type ClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user$variables = {|
  id: string,
|};
export type ClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user$fragmentType,
  |},
|};
export type ClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user = {|
  response: ClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user$data,
  variables: ClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user$variables,
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
    "name": "ClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user",
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
            "name": "RefetchableClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user"
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
    "name": "ClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user",
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
    "cacheID": "81c68d70c6784d71b29ff3f553692c95",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user on User {\n  name\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f39e561157fa607bf64e77aad228aa05";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user$variables,
  ClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user$data,
>*/);
