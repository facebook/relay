/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<62b25462ab1aae33b9653d6b2e2f92df>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_LiveExternalGreetingFragment_user$fragmentType } from "./RefetchableClientEdgeQuery_LiveExternalGreetingFragment_user.graphql";
export type ClientEdgeQuery_LiveExternalGreetingFragment_user$variables = {|
  id: string,
|};
export type ClientEdgeQuery_LiveExternalGreetingFragment_user$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_LiveExternalGreetingFragment_user$fragmentType,
  |},
|};
export type ClientEdgeQuery_LiveExternalGreetingFragment_user = {|
  response: ClientEdgeQuery_LiveExternalGreetingFragment_user$data,
  variables: ClientEdgeQuery_LiveExternalGreetingFragment_user$variables,
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
    "name": "ClientEdgeQuery_LiveExternalGreetingFragment_user",
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
            "name": "RefetchableClientEdgeQuery_LiveExternalGreetingFragment_user"
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
    "name": "ClientEdgeQuery_LiveExternalGreetingFragment_user",
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
    "cacheID": "2164690188cc1b9133004eab9d8749c1",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_LiveExternalGreetingFragment_user",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_LiveExternalGreetingFragment_user(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_LiveExternalGreetingFragment_user\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_LiveExternalGreetingFragment_user on User {\n  name\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d99958d995a71b9db58b73932515179f";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeQuery_LiveExternalGreetingFragment_user$variables,
  ClientEdgeQuery_LiveExternalGreetingFragment_user$data,
>*/);
