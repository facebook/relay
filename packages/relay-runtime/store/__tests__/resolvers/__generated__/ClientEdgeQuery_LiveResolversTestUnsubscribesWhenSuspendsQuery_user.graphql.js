/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5142c08c2dc9fccab9261f16fb85a91c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user$fragmentType } from "./RefetchableClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user.graphql";
export type ClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user$variables = {|
  id: string,
|};
export type ClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user$fragmentType,
  |},
|};
export type ClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user = {|
  response: ClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user$data,
  variables: ClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user$variables,
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
    "name": "ClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user",
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
            "name": "RefetchableClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user"
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
    "name": "ClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user",
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c8e045205266db540024bb730dd02728",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user on User {\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "06f9d01a4042d27c7e069bc35d4694c1";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user$variables,
  ClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user$data,
>*/);
