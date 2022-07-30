/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<58ccc8b0212daa7ea5b7c0afcf87a197>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RefetchableClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge$fragmentType = any;
export type ClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge$variables = {|
  id: string,
|};
export type ClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge$fragmentType,
  |},
|};
export type ClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge = {|
  response: ClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge$data,
  variables: ClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge$variables,
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
    "name": "ClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge",
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
            "name": "RefetchableClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge"
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
    "name": "ClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge",
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
                "name": "actorCount",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "alternate_name",
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
    "cacheID": "a7683edafa87e928ab84de5fd4ca618a",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge\n    id\n  }\n}\n\nfragment QueryResourceClientEdgesTestUser1Fragment on User {\n  actorCount\n}\n\nfragment QueryResourceClientEdgesTestUser2Fragment on User {\n  alternate_name\n}\n\nfragment RefetchableClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge on User {\n  ...QueryResourceClientEdgesTestUser1Fragment\n  ...QueryResourceClientEdgesTestUser2Fragment\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "0e90f7bbad806fa00859d97367fe56b8";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge$variables,
  ClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge$data,
>*/);
