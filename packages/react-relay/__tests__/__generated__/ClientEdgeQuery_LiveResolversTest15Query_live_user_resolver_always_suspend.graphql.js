/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5db8914c2de45377aab37a4fcad8a621>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$fragmentType } from "./RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend.graphql";
export type ClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$variables = {|
  id: string,
|};
export type ClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$fragmentType,
  |},
|};
export type ClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend = {|
  response: ClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$data,
  variables: ClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$variables,
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
    "name": "ClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend",
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
            "name": "RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend"
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
    "name": "ClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend",
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
    "cacheID": "2d17f69ebe9db1e467f4716965b3b641",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend on User {\n  name\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "649fcb31c6138f80ad0ebb97c80d9ae6";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$variables,
  ClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend$data,
>*/);
